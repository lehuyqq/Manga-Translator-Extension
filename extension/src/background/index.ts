import { DEFAULT_SETTINGS, type AppSettings } from '../shared/types.js';
import type { TranslateRequest, TranslateResponse } from '../shared/types.js';
import { normalizeUiLanguage } from '../shared/i18n.js';

const STORAGE_KEY = 'manga_translator_settings';

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(STORAGE_KEY);
  if (!current[STORAGE_KEY]) {
    await chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_SETTINGS });
  } else {
    await chrome.storage.local.set({ [STORAGE_KEY]: normalizeSettings(current[STORAGE_KEY] as Partial<AppSettings>) });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void (async () => {
    if (message.type === 'GET_SETTINGS') {
      sendResponse({ settings: await getSettings() });
      return;
    }

    if (message.type === 'SAVE_SETTINGS') {
      await chrome.storage.local.set({ [STORAGE_KEY]: message.settings as AppSettings });
      sendResponse({ ok: true });
      return;
    }

    if (message.type === 'CHECK_HEALTH') {
      const settings = await getSettings();
      sendResponse(await checkHealth(settings.backendUrl));
      return;
    }

    if (message.type === 'OPEN_SCANNER') {
      const tabId = message.tabId as number | undefined;
      if (!tabId) {
        sendResponse({ ok: false, error: 'Missing tab id' });
        return;
      }

      try {
        await ensureContentScript(tabId);
        await chrome.tabs.sendMessage(tabId, { type: 'OPEN_SCANNER' });
        sendResponse({ ok: true });
      } catch (error) {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) });
      }
      return;
    }

    if (message.type === 'FETCH_IMAGE') {
      const url = message.url as string;
      const pageUrl: string = message.pageUrl as string || '';
      const referer = pageUrl ? pageUrl.split('/').slice(0, 3).join('/') : '';
      console.log('[BG] FETCH_IMAGE url:', url, 'referer:', referer);
      try {
        const res = await fetch(url, {
          headers: {
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': referer,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        console.log('[BG] FETCH_IMAGE response status:', res.status, res.statusText);
        if (!res.ok) {
          console.log('[BG] FETCH_IMAGE failed with', res.status, 'for url:', url);
          sendResponse({ error: `Image fetch failed: HTTP ${res.status} for ${url}` });
          return;
        }
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
          sendResponse({ base64 });
        };
        reader.onerror = () => {
          console.log('[BG] FETCH_IMAGE FileReader error');
          sendResponse({ error: 'FileReader failed' });
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log('[BG] FETCH_IMAGE exception:', msg);
        sendResponse({ error: `Fetch exception: ${msg}` });
      }
      return;
    }

    if (message.type === 'FETCH_CHAPTER') {
      const url = message.url as string;
      try {
        const result = await fetchChapterHTML(url);
        sendResponse(result);
      } catch (error) {
        sendResponse({ error: error instanceof Error ? error.message : String(error) });
      }
      return;
    }

    if (message.type === 'TRANSLATE_IMAGE') {
      const { imageUrl, pageUrl } = message as { type: string; imageUrl: string; pageUrl?: string };
      console.log('[BG] TRANSLATE_IMAGE:', imageUrl, 'pageUrl:', pageUrl);
      try {
        const result = await fetchAndTranslate(imageUrl, pageUrl);
        console.log('[BG] fetchAndTranslate result:', result);
        sendResponse(result);
      } catch (error) {
        console.log('[BG] fetchAndTranslate error:', error);
        sendResponse({ error: error instanceof Error ? error.message : String(error) });
      }
      return;
    }

    if (message.type === 'LIST_MODELS') {
      const { baseUrl, apiKey } = message as { type: string; baseUrl: string; apiKey: string };
      console.log('[BG] LIST_MODELS:', baseUrl);
      try {
        const models = await fetchModelList(baseUrl, apiKey);
        console.log('[BG] LIST_MODELS result:', models.length, 'models');
        sendResponse({ models });
      } catch (error) {
        console.log('[BG] LIST_MODELS error:', error);
        sendResponse({ error: error instanceof Error ? error.message : String(error) });
      }
      return;
    }

    if (message.type === 'TRANSLATE_IMAGE_WITH_BODY') {
      const { imageUrl, pageUrl, body } = message as { type: string; imageUrl: string; pageUrl?: string; body: TranslateRequest };
      console.log('[BG] TRANSLATE_IMAGE_WITH_BODY:', imageUrl, 'pageUrl:', pageUrl);
      try {
        const result = await fetchAndTranslateWithBody(imageUrl, pageUrl, body);
        console.log('[BG] fetchAndTranslateWithBody result:', result);
        sendResponse(result);
      } catch (error) {
        console.log('[BG] fetchAndTranslateWithBody error:', error);
        sendResponse({ error: error instanceof Error ? error.message : String(error) });
      }
      return;
    }
  })();

  return true;
});

// ─────────────────────────────────────────────────────────────────────────────
// Fetch model list from OpenAI-compatible endpoint (runs in background — no CORS)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchModelList(baseUrl: string, apiKey: string): Promise<string[]> {
  const endpoint = `${baseUrl.replace(/\/$/, '')}/models`;
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(endpoint, { method: 'GET', headers });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json() as Record<string, unknown>;
      const err = body['error'];
      if (typeof err === 'object' && err !== null && 'message' in err) {
        detail = String((err as { message?: string }).message);
      } else if (typeof err === 'string') {
        detail = err;
      } else if (typeof body['message'] === 'string') {
        detail = String(body['message']);
      }
    } catch { /* ignore parse errors */ }
    throw new Error(detail);
  }

  const data = await res.json() as { data?: Array<{ id?: string }> };
  if (Array.isArray(data)) {
    return data.map((m) => m.id).filter(Boolean) as string[];
  }
  if (data?.data && Array.isArray(data.data)) {
    return data.data.map((m) => m.id).filter(Boolean) as string[];
  }
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch image + translate via backend (runs in background — no CORS)
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAndTranslateWithBody(imageUrl: string, pageUrl: string | undefined, body: TranslateRequest): Promise<TranslateResult> {
  // Image is already fetched and base64-encoded by content script (with page cookies/auth).
  // Background only calls the backend API — no image fetching here.
  void imageUrl; void pageUrl;

  const settings = await getSettings();
  const backendUrl = settings.backendUrl || 'http://localhost:7677';
  const endpoint = `${backendUrl.replace(/\/$/, '')}/translate`;

  try {
    console.log('[BG] fetchAndTranslateWithBody calling backend:', endpoint);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log('[BG] fetchAndTranslateWithBody backend status:', res.status, res.statusText);
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const errBody = await res.json() as Record<string, unknown>;
        if (typeof errBody['detail'] === 'string') detail = errBody['detail'];
        else detail = JSON.stringify(errBody).slice(0, 200);
      } catch { /* ignore */ }
      return { error: `Translate failed: ${detail}` };
    }
    const data = (await res.json()) as TranslateResponse;
    console.log('[BG] fetchAndTranslateWithBody success');
    return {
      translated_image: data.translated_image,
      bubbles: data.bubbles,
      processing_time_seconds: data.processing_time_seconds,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log('[BG] fetchAndTranslateWithBody backend exception:', msg);
    return { error: `Translate error: ${msg}` };
  }
}

interface TranslateResult {
  translated_image?: string;
  bubbles?: unknown[];
  processing_time_seconds?: number;
  error?: string;
}

async function fetchAndTranslate(imageUrl: string, pageUrl: string | undefined): Promise<TranslateResult> {
  const referer = pageUrl ? pageUrl.split('/').slice(0, 3).join('/') : '';
  console.log('[BG] fetchAndTranslate url:', imageUrl, 'referer:', referer);
  // 1. Fetch image
  let base64: string | null = null;
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': referer,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    console.log('[BG] fetchAndTranslate image status:', res.status, res.statusText);
    if (!res.ok) return { error: `Image fetch failed: HTTP ${res.status} for ${imageUrl}` };
    const blob = await res.blob();
    base64 = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onloadend = () => resolve((fr.result as string).replace(/^data:image\/\w+;base64,/, ''));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log('[BG] fetchAndTranslate image exception:', msg);
    return { error: `Image fetch error: ${msg}` };
  }

  // 2. Translate
  const settings = await getSettings();
  const backendUrl = settings.backendUrl || 'http://localhost:7677';
  const endpoint = `${backendUrl.replace(/\/$/, '')}/translate`;

  const body: TranslateRequest = {
    image: base64,
    input_language: settings.config.inputLanguage,
    output_language: settings.config.outputLanguage,
    provider: settings.config.provider,
    base_url: settings.config.baseUrl,
    model_name: settings.config.modelName,
    api_key: settings.config.apiKey,
    temperature: settings.config.temperature,
    top_p: settings.config.topP,
    top_k: settings.config.topK,
    translation_mode: settings.config.translationMode,
    ocr_method: settings.config.ocrMethod,
    max_font_size: settings.config.maxFontSize,
    min_font_size: settings.config.minFontSize,
    supersampling_factor: settings.config.supersamplingFactor,
    send_full_page_context: settings.config.sendFullPageContext,
    image_detail: settings.config.imageDetail,
    outside_text_enabled: settings.config.outsideTextEnabled ?? false,
  };

  try {
    console.log('[BG] fetchAndTranslate calling backend:', endpoint);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const errBody = await res.json() as Record<string, unknown>;
        if (typeof errBody['detail'] === 'string') detail = errBody['detail'];
        else detail = JSON.stringify(errBody).slice(0, 200);
      } catch { /* ignore */ }
      console.log('[BG] fetchAndTranslate backend error:', detail);
      return { error: `Translate failed: ${detail}` };
    }

    const data = (await res.json()) as TranslateResponse;
    console.log('[BG] fetchAndTranslate success');
    return {
      translated_image: data.translated_image,
      bubbles: data.bubbles,
      processing_time_seconds: data.processing_time_seconds,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log('[BG] fetchAndTranslate backend exception:', msg);
    return { error: `Translate error: ${msg}` };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch chapter HTML and extract page info
// ─────────────────────────────────────────────────────────────────────────────

interface ChapterInfo {
  totalPages: number;
  pageUrls: string[];       // direct image URLs if found
  pattern?: { baseUrl: string; pageNumber: number; padding: number; extension: string } | null;
  error?: string;
}

async function fetchChapterHTML(url: string): Promise<ChapterInfo> {
  const res = await fetch(url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    return { totalPages: 0, pageUrls: [], error: `HTTP ${res.status}` };
  }

  const html = await res.text();
  return parseChapterHTML(html, url);
}

function parseChapterHTML(html: string, _pageUrl: string): ChapterInfo {
  const result: ChapterInfo = { totalPages: 0, pageUrls: [] };

  // Strategy A: JSON data embedded in <script>
  const jsonMatch = html.match(/"(?:total_pages|totalPages|pageCount|page_count|total)":\s*(\d+)/i);
  if (jsonMatch) result.totalPages = parseInt(jsonMatch[1], 10);

  // Strategy B: data-* attributes
  if (!result.totalPages) {
    const dataMatch = html.match(/data-(?:pages|total|pages_count)\s*=\s*["']?(\d+)/i);
    if (dataMatch) result.totalPages = parseInt(dataMatch[1], 10);
  }

  // Strategy C: URL array in script
  const arrayMatch = html.match(/\[\s*"([^"]+\.(?:jpg|jpeg|png|webp|gif|avif)[^"]*)"/);
  if (arrayMatch) {
    const urls = extractArrayUrls(html);
    if (urls.length > 0) { result.pageUrls = urls; result.totalPages = urls.length; }
  }

  // Strategy D: image URLs in JS script blocks
  if (result.pageUrls.length === 0) {
    result.pageUrls = extractImageUrlsFromScript(html);
  }

  // Strategy E: option values with image URLs
  const optionMatches = [...html.matchAll(/<option[^>]*value=["']?([^"'>]+)["']?[^>]*>/gi)];
  if (optionMatches.length > 1) {
    const uniqueValues = new Set(optionMatches.map((m) => m[1]).filter((v) => v.includes('/') || v.includes('.')));
    if (uniqueValues.size > 2) {
      result.pageUrls = [...uniqueValues].filter((u) => /\.(jpg|jpeg|png|webp|gif|avif)/i.test(u));
      if (result.pageUrls.length > 0) result.totalPages = result.pageUrls.length;
    }
  }

  // Strategy F: "Page X of Y" text
  if (!result.totalPages) {
    const pageTextMatch = html.match(/(\d+)\s*[/\-–|]\s*(\d+)/);
    if (pageTextMatch) {
      const second = parseInt(pageTextMatch[2], 10);
      const first = parseInt(pageTextMatch[1], 10);
      if (second > first) result.totalPages = second;
    }
  }

  // Extract URL pattern
  if (result.pageUrls.length > 0) {
    result.pattern = detectUrlPattern(result.pageUrls);
  } else if (result.totalPages > 0) {
    const imgUrls = extractImageUrlsFromHTML(html);
    if (imgUrls.length > 0) result.pattern = detectUrlPattern(imgUrls);
  }

  return result;
}

function extractArrayUrls(html: string): string[] {
  const results: string[] = [];
  const matches = html.match(/"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif|avif)[^"]*)"/gi);
  if (matches) {
    for (const m of matches) {
      const url = m.replace(/^"|"$/g, '');
      if (!results.includes(url)) results.push(url);
    }
  }
  return results;
}

function extractImageUrlsFromScript(html: string): string[] {
  const results: string[] = [];
  const srcMatches = html.matchAll(/(?:src|image|img|page_url|url)\s*:\s*["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif|avif)[^"']*)["']/gi);
  for (const m of srcMatches) {
    if (!results.includes(m[1])) results.push(m[1]);
  }
  return results;
}

function extractImageUrlsFromHTML(html: string): string[] {
  const results: string[] = [];
  const srcMatches = html.matchAll(/(?:src|data-src|data-lazy|data-original|data-image)\s*=\s*["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif|avif)[^"']*)["']/gi);
  for (const m of srcMatches) {
    if (!results.includes(m[1])) results.push(m[1]);
  }
  return results;
}

interface UrlPattern {
  baseUrl: string;
  pageNumber: number;
  padding: number;
  extension: string;
}

function detectUrlPattern(urls: string[]): UrlPattern | null {
  if (urls.length < 1) return null;
  const url = urls[urls.length - 1];
  const numbers = [...url.matchAll(/\d+/g)].map((m) => ({ value: +m[0], index: m.index! }));
  if (numbers.length === 0) return null;
  const lastNum = numbers[numbers.length - 1];
  return {
    baseUrl: url.substring(0, lastNum.index),
    pageNumber: lastNum.value,
    padding: String(lastNum.value).length,
    extension: url.substring(lastNum.index + String(lastNum.value).length),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return normalizeSettings(result[STORAGE_KEY] as Partial<AppSettings> | undefined);
}

function normalizeSettings(raw?: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...(raw ?? {}),
    uiLanguage: normalizeUiLanguage(raw?.uiLanguage),
    config: {
      ...DEFAULT_SETTINGS.config,
      ...(raw?.config ?? {}),
    },
  };
}

async function ensureContentScript(tabId: number): Promise<void> {
  const pingContentScript = async (): Promise<boolean> => {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
      return Boolean(response?.ok);
    } catch {
      return false;
    }
  };

  if (await pingContentScript()) return;

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content-script/index.js'],
  });
  if (!(await pingContentScript())) {
    throw new Error('Content script did not start on this page');
  }
}

async function checkHealth(backendUrl: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${backendUrl.replace(/\/$/, '')}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { ok: response.ok };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

