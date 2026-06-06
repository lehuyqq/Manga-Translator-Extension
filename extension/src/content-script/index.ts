import type { AppSettings, TranslateRequest } from '../shared/types.js';

const ROOT_ID  = 'mt-scanner-root';
const STYLE_ID = 'mt-scanner-style';
const STORAGE_KEY = 'manga_translator_settings';
const TRANSLATED_CACHE_KEY = 'mt_translated_cache'; // rawUrl -> translated base64
const TRANSLATED_CACHE_PREFIX = 'mt_translated_cache:';
const DEFAULT_BACKEND_URL = 'http://localhost:7677';

type UiLanguage = 'en' | 'vi' | 'zh' | 'ja' | 'ko';

const EN_MESSAGES = {
  autoMt: 'Auto MT',
  autoMtDone: 'Auto MT Done',
  stop: 'Stop',
  translatedBadgeTitle: 'Translated by MangaTranslator',
  noMangaImagesPage: 'No manga images found on this page.',
  pageAlt: 'Page {page}',
  pagesLabel: 'pages',
  all: 'All',
  none: 'None',
  close: 'Close',
  foundImagesOnPage: 'Found {count} images on this page',
  autoCollect: 'Auto-collect',
  cancel: 'Cancel',
  translate: 'Translate',
  starting: 'Starting...',
  cancelledTranslated: 'Cancelled - {success}/{total} translated',
  allImagesTranslated: 'All {count} images translated!',
  partialTranslated: '{success}/{total} translated',
  scanningPage: 'Scanning page...',
  noImagesFoundOnPage: 'No images found on page',
  foundImages: 'Found {count} images...',
  foundMangaImages: 'Found {count} manga images',
  cached: 'Cached',
  loadError: 'Load error',
  sending: 'Sending...',
  translating: 'Translating...',
  noResult: 'No result',
  bubbles: '{count} bubbles - {time}s',
  doneWithTime: 'Done - {time}s',
  networkError: 'Network error',
};

type ContentMessageKey = keyof typeof EN_MESSAGES;

const CONTENT_MESSAGES: Record<UiLanguage, Record<ContentMessageKey, string>> = {
  en: EN_MESSAGES,
  vi: {
    autoMt: 'Auto MT',
    autoMtDone: 'Auto MT xong',
    stop: 'Dung',
    translatedBadgeTitle: 'Da dich bang MangaTranslator',
    noMangaImagesPage: 'Khong tim thay anh manga tren trang nay.',
    pageAlt: 'Trang {page}',
    pagesLabel: 'trang',
    all: 'Tat ca',
    none: 'Bo chon',
    close: 'Dong',
    foundImagesOnPage: 'Tim thay {count} anh tren trang nay',
    autoCollect: 'Tu thu thap',
    cancel: 'Huy',
    translate: 'Dich',
    starting: 'Dang bat dau...',
    cancelledTranslated: 'Da huy - da dich {success}/{total}',
    allImagesTranslated: 'Da dich toan bo {count} anh!',
    partialTranslated: 'Da dich {success}/{total}',
    scanningPage: 'Dang quet trang...',
    noImagesFoundOnPage: 'Khong tim thay anh tren trang',
    foundImages: 'Tim thay {count} anh...',
    foundMangaImages: 'Tim thay {count} anh manga',
    cached: 'Tu cache',
    loadError: 'Loi tai anh',
    sending: 'Dang gui...',
    translating: 'Dang dich...',
    noResult: 'Khong co ket qua',
    bubbles: '{count} bubble - {time}s',
    doneWithTime: 'Xong - {time}s',
    networkError: 'Loi mang',
  },
  zh: {
    autoMt: '自动 MT',
    autoMtDone: '自动 MT 完成',
    stop: '停止',
    translatedBadgeTitle: '由 MangaTranslator 翻译',
    noMangaImagesPage: '此页面没有找到漫画图片。',
    pageAlt: '第 {page} 页',
    pagesLabel: '页',
    all: '全选',
    none: '全不选',
    close: '关闭',
    foundImagesOnPage: '在此页面找到 {count} 张图片',
    autoCollect: '自动收集',
    cancel: '取消',
    translate: '翻译',
    starting: '正在开始...',
    cancelledTranslated: '已取消 - 已翻译 {success}/{total}',
    allImagesTranslated: '已翻译全部 {count} 张图片！',
    partialTranslated: '已翻译 {success}/{total}',
    scanningPage: '正在扫描页面...',
    noImagesFoundOnPage: '页面上没有找到图片',
    foundImages: '找到 {count} 张图片...',
    foundMangaImages: '找到 {count} 张漫画图片',
    cached: '缓存',
    loadError: '加载错误',
    sending: '正在发送...',
    translating: '正在翻译...',
    noResult: '无结果',
    bubbles: '{count} 个气泡 - {time}s',
    doneWithTime: '完成 - {time}s',
    networkError: '网络错误',
  },
  ja: {
    autoMt: 'Auto MT',
    autoMtDone: 'Auto MT 完了',
    stop: '停止',
    translatedBadgeTitle: 'MangaTranslator で翻訳済み',
    noMangaImagesPage: 'このページに漫画画像が見つかりません。',
    pageAlt: 'ページ {page}',
    pagesLabel: 'ページ',
    all: 'すべて',
    none: 'なし',
    close: '閉じる',
    foundImagesOnPage: 'このページで {count} 枚の画像を検出',
    autoCollect: '自動収集',
    cancel: 'キャンセル',
    translate: '翻訳',
    starting: '開始中...',
    cancelledTranslated: 'キャンセル - {success}/{total} 翻訳済み',
    allImagesTranslated: '{count} 枚すべて翻訳しました！',
    partialTranslated: '{success}/{total} 翻訳済み',
    scanningPage: 'ページをスキャン中...',
    noImagesFoundOnPage: 'ページに画像が見つかりません',
    foundImages: '{count} 枚の画像を検出...',
    foundMangaImages: '{count} 枚の漫画画像を検出',
    cached: 'キャッシュ',
    loadError: '読み込みエラー',
    sending: '送信中...',
    translating: '翻訳中...',
    noResult: '結果なし',
    bubbles: '{count} 吹き出し - {time}s',
    doneWithTime: '完了 - {time}s',
    networkError: 'ネットワークエラー',
  },
  ko: {
    autoMt: 'Auto MT',
    autoMtDone: 'Auto MT 완료',
    stop: '중지',
    translatedBadgeTitle: 'MangaTranslator로 번역됨',
    noMangaImagesPage: '이 페이지에서 만화 이미지를 찾지 못했습니다.',
    pageAlt: '페이지 {page}',
    pagesLabel: '페이지',
    all: '전체',
    none: '선택 해제',
    close: '닫기',
    foundImagesOnPage: '이 페이지에서 이미지 {count}개 발견',
    autoCollect: '자동 수집',
    cancel: '취소',
    translate: '번역',
    starting: '시작 중...',
    cancelledTranslated: '취소됨 - {success}/{total} 번역됨',
    allImagesTranslated: '이미지 {count}개 모두 번역됨!',
    partialTranslated: '{success}/{total} 번역됨',
    scanningPage: '페이지 스캔 중...',
    noImagesFoundOnPage: '페이지에서 이미지를 찾지 못했습니다',
    foundImages: '이미지 {count}개 발견...',
    foundMangaImages: '만화 이미지 {count}개 발견',
    cached: '캐시',
    loadError: '로드 오류',
    sending: '전송 중...',
    translating: '번역 중...',
    noResult: '결과 없음',
    bubbles: '말풍선 {count}개 - {time}s',
    doneWithTime: '완료 - {time}s',
    networkError: '네트워크 오류',
  },
};

function normalizeUiLanguage(language: unknown): UiLanguage {
  return language === 'vi' || language === 'zh' || language === 'ja' || language === 'ko' ? language : 'en';
}

// ─────────────────────────────────────────────────────────────────────────────
// Extension message listener
// ─────────────────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, send) => {
  if (msg.type === 'PING') { send({ ok: true }); return false; }
  if (msg.type === 'OPEN_SCANNER') {
    void openScanner().then(() => send({ ok: true })).catch((e) => send({ ok: false, error: String(e) }));
    return true;
  }
  if (msg.type === 'START_AUTO_TRANSLATE') {
    void startAutoTranslate().then(() => send({ ok: true })).catch((e) => send({ ok: false, error: String(e) }));
    return true;
  }
  if (msg.type === 'STOP_AUTO_TRANSLATE') {
    stopAutoTranslate();
    send({ ok: true });
    return false;
  }
  if (msg.type === 'GET_AUTO_TRANSLATE_STATUS') {
    send({ active: autoTranslateActive });
    return false;
  }
  if (msg.type === 'CLEAR_CACHE') {
    void clearTranslatedCache();
    send({ ok: true });
    return false;
  }
  return false;
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared scanner state
// ─────────────────────────────────────────────────────────────────────────────

interface PageEntry {
  index: number;
  thumb: string;
  rawUrl: string;
  fetched: boolean;
}

let abortCollect = false;
let abortTranslate = false;
let currentPages: PageEntry[] = [];
let currentShadow: ShadowRoot | null = null;
let totalChapterPages = 0;
let seenUrls = new Set<string>();
let imageCache = new Map<string, string>();
let uiLanguage: UiLanguage = 'en';

function tr(key: ContentMessageKey, vars: Record<string, string | number> = {}): string {
  const template = CONTENT_MESSAGES[uiLanguage]?.[key] ?? EN_MESSAGES[key] ?? key;
  return Object.entries(vars).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), template);
}

async function refreshUiLanguage(): Promise<void> {
  const settings = await loadSettings();
  uiLanguage = normalizeUiLanguage(settings.uiLanguage);
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-translate state
// ─────────────────────────────────────────────────────────────────────────────

let autoTranslateActive = false;
let autoTranslateObserver: MutationObserver | null = null;
let autoTranslateIntersectionObserver: IntersectionObserver | null = null;
let autoTranslateScanTimer: number | undefined;
let autoTranslatePeriodicTimer: number | undefined;
let autoTranslateRemoveUiTimer: number | undefined;
let autoTranslateQueue: Array<{ img: HTMLImageElement; url: string }> = [];
let autoTranslateQueuedUrls = new Set<string>();
let autoTranslateInFlightUrls = new Set<string>();
let autoTranslateProcessing = false;
let autoTranslateConcurrent = 0;
let scannerPausedAutoTranslate = false;
let translatedOverlayCounter = 0;
const AUTO_MAX_CONCURRENT = 1;
const AUTO_VIEWPORT_MARGIN_PX = 250;
const AUTO_PREFETCH_PAGES = 3;
const AUTO_SCAN_LIMIT = 250;
const LAZY_IMAGE_ATTRS = ['data-src', 'data-lazy-src', 'data-original', 'data-srcset', 'data-lazy', 'data-image'] as const;
const AUTO_RETRY_MAP = new Map<string, number>(); // url -> retry count
const AUTO_RETRY_MAX = 3;

// ─────────────────────────────────────────────────────────────────────────────
// Auto-translate: start / stop
// ─────────────────────────────────────────────────────────────────────────────

async function startAutoTranslate(): Promise<void> {
  if (autoTranslateActive) return;
  await refreshUiLanguage();
  autoTranslateActive = true;
  if (autoTranslateRemoveUiTimer !== undefined) {
    clearTimeout(autoTranslateRemoveUiTimer);
    autoTranslateRemoveUiTimer = undefined;
  }

  // Load already-translated URLs from cache
  await loadTranslatedCache();

  // Inject floating indicator
  injectAutoTranslateUI();
  autoTranslateIntersectionObserver = new IntersectionObserver(
    (entries) => {
      if (!autoTranslateActive) return;
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLImageElement)) continue;
        handleAutoTranslateImage(entry.target, true);
      }
      void processAutoTranslateQueue();
    },
    { rootMargin: `${AUTO_VIEWPORT_MARGIN_PX}px 0px ${AUTO_VIEWPORT_MARGIN_PX}px 0px`, threshold: 0.01 },
  );

  scanAutoTranslateImages(document);

  void processAutoTranslateQueue();

  // Watch for new images and lazy-loader attribute changes.
  autoTranslateObserver = new MutationObserver((mutations) => {
    if (!autoTranslateActive) return;
    for (const mut of mutations) {
      for (const node of mut.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const el = node as Element;

        if (el.tagName === 'IMG') {
          handleAutoTranslateImage(el as HTMLImageElement);
        }

        scanAutoTranslateImages(el);
      }
    }
    void processAutoTranslateQueue();
  });

  autoTranslateObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  window.addEventListener('scroll', scheduleAutoTranslateScan, { passive: true });
  window.addEventListener('resize', scheduleAutoTranslateScan, { passive: true });
  autoTranslatePeriodicTimer = window.setInterval(scheduleAutoTranslateScan, 4000);

  updateAutoTranslateIndicator('active');
}

function scheduleAutoTranslateScan(): void {
  if (!autoTranslateActive) return;
  if (autoTranslateScanTimer !== undefined) return;
  autoTranslateScanTimer = window.setTimeout(() => {
    autoTranslateScanTimer = undefined;
    scanAutoTranslateImages(document);
    void processAutoTranslateQueue();
  }, 350);
}

function scanAutoTranslateImages(root: ParentNode): void {
  const imgs = root instanceof HTMLImageElement
    ? [root]
    : Array.from(root.querySelectorAll<HTMLImageElement>('img'));
  let handled = 0;
  for (const img of imgs) {
    handleAutoTranslateImage(img);
    handled++;
    if (handled >= AUTO_SCAN_LIMIT) break;
  }
}

function isNearViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const viewportH = window.innerHeight || document.documentElement.clientHeight;
  const viewportW = window.innerWidth || document.documentElement.clientWidth;
  return rect.bottom >= -AUTO_VIEWPORT_MARGIN_PX
    && rect.top <= viewportH + AUTO_VIEWPORT_MARGIN_PX
    && rect.right >= -200
    && rect.left <= viewportW + 200;
}

function isUsableImageUrl(url: string | null | undefined): url is string {
  return !!url && url !== window.location.href && !url.startsWith('blob:') && !url.startsWith('data:');
}

function firstSrcsetUrl(value: string): string | null {
  return value.split(',')[0]?.trim().split(/\s+/)[0] || null;
}

function resolveLazyAttributeSrc(img: HTMLImageElement): string | null {
  for (const attr of LAZY_IMAGE_ATTRS) {
    const val = img.getAttribute(attr);
    if (!val) continue;

    const candidate = attr === 'data-srcset' ? firstSrcsetUrl(val) : val;
    if (isUsableImageUrl(candidate)) return candidate;
  }

  return null;
}

function handleAutoTranslateImage(img: HTMLImageElement, force = false): void {
  if (img.getAttribute('data-mt-translated') === 'true' && (img.currentSrc || img.src).startsWith('data:image/')) {
    return;
  }

  const url = resolveMangaUrl(img);
  if (!url) return;
  img.setAttribute('data-mt-raw', url);

  if (!force && !isNearViewport(img)) {
    autoTranslateIntersectionObserver?.observe(img);
    return;
  }

  autoTranslateIntersectionObserver?.unobserve(img);

  const cached = translatedCache.get(url);
  if (cached) {
    applyTranslatedImage(img, `data:image/png;base64,${cached}`, url);
    if (isNearViewport(img)) queueAutoTranslateLookahead(img);
    return;
  }

  queueAutoTranslateImage(img, url);
  queueAutoTranslateLookahead(img);
}

function queueAutoTranslateImage(img: HTMLImageElement, url: string): boolean {
  if (translatedCache.has(url)) {
    applyTranslatedImage(img, `data:image/png;base64,${translatedCache.get(url)!}`, url);
    return false;
  }

  if (autoTranslateQueuedUrls.has(url) || autoTranslateInFlightUrls.has(url)) return false;
  if ((AUTO_RETRY_MAP.get(url) ?? 0) >= AUTO_RETRY_MAX) return false;

  autoTranslateQueuedUrls.add(url);
  autoTranslateQueue.push({ img, url });
  autoTranslateIntersectionObserver?.unobserve(img);
  return true;
}

function queueAutoTranslateLookahead(anchorImg: HTMLImageElement): number {
  const anchorUrl = anchorImg.getAttribute('data-mt-raw') ?? resolveMangaUrl(anchorImg);
  if (!anchorUrl) return 0;

  const entries = collectAutoTranslateImageEntries(document);
  const anchorIndex = entries.findIndex((entry) => entry.img === anchorImg || entry.url === anchorUrl);
  if (anchorIndex < 0) return 0;

  const seenUrls = new Set<string>([anchorUrl]);
  let aheadPages = 0;
  for (let i = anchorIndex + 1; i < entries.length && aheadPages < AUTO_PREFETCH_PAGES; i++) {
    const entry = entries[i];
    if (seenUrls.has(entry.url)) continue;
    seenUrls.add(entry.url);
    aheadPages++;
    queueAutoTranslateImage(entry.img, entry.url);
  }

  return aheadPages;
}

function collectAutoTranslateImageEntries(root: ParentNode): Array<{ img: HTMLImageElement; url: string }> {
  const imgs = root instanceof HTMLImageElement
    ? [root]
    : Array.from(root.querySelectorAll<HTMLImageElement>('img'));
  const entries: Array<{ img: HTMLImageElement; url: string }> = [];

  for (const img of imgs) {
    if (img.classList.contains('mt-page-overlay')) continue;
    const url = resolveMangaUrl(img);
    if (!url) continue;
    img.setAttribute('data-mt-raw', url);
    entries.push({ img, url });
    if (entries.length >= AUTO_SCAN_LIMIT) break;
  }

  return entries;
}

function stopAutoTranslate(preserveScannerResume = false): void {
  autoTranslateActive = false;
  if (!preserveScannerResume) scannerPausedAutoTranslate = false;
  autoTranslateQueue = [];
  autoTranslateQueuedUrls = new Set();
  if (autoTranslateObserver) {
    autoTranslateObserver.disconnect();
    autoTranslateObserver = null;
  }
  if (autoTranslateIntersectionObserver) {
    autoTranslateIntersectionObserver.disconnect();
    autoTranslateIntersectionObserver = null;
  }
  if (autoTranslateScanTimer !== undefined) {
    clearTimeout(autoTranslateScanTimer);
    autoTranslateScanTimer = undefined;
  }
  if (autoTranslatePeriodicTimer !== undefined) {
    clearInterval(autoTranslatePeriodicTimer);
    autoTranslatePeriodicTimer = undefined;
  }
  window.removeEventListener('scroll', scheduleAutoTranslateScan);
  window.removeEventListener('resize', scheduleAutoTranslateScan);
  updateAutoTranslateIndicator('stopped');
  if (autoTranslateRemoveUiTimer !== undefined) clearTimeout(autoTranslateRemoveUiTimer);
  autoTranslateRemoveUiTimer = window.setTimeout(() => {
    autoTranslateRemoveUiTimer = undefined;
    removeAutoTranslateUI();
  }, 600);
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-translate: resolve manga image URL
// ─────────────────────────────────────────────────────────────────────────────

function resolveMangaUrl(img: HTMLImageElement): string | null {
  const existingRaw = img.getAttribute('data-mt-raw');
  if (existingRaw && !existingRaw.startsWith('data:') && !existingRaw.startsWith('blob:')) return existingRaw;

  // Skip icons, avatars, small images
  const w = img.naturalWidth || Number(img.getAttribute('width')) || 0;
  const h = img.naturalHeight || Number(img.getAttribute('height')) || 0;
  const renderedW = img.getBoundingClientRect().width;
  if (w > 0 && h > 0 && (w < 150 || h < 100)) return null;
  if (w === 0 && h === 0 && renderedW > 0 && renderedW < 150) return null;

  const src = resolveLazyAttributeSrc(img) ?? img.currentSrc ?? img.src;
  if (!isUsableImageUrl(src)) return null;

  // Skip common non-manga images
  if (/avatar|icon|logo|btn|nav|header|footer|banner|placeholder|loading/i.test(src)) return null;

  return src;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-translate: queue processor
// ─────────────────────────────────────────────────────────────────────────────

async function processAutoTranslateQueue(): Promise<void> {
  if (!autoTranslateActive) return;
  if (autoTranslateProcessing) return;
  autoTranslateProcessing = true;

  while (autoTranslateQueue.length > 0 && autoTranslateConcurrent < AUTO_MAX_CONCURRENT) {
    const item = autoTranslateQueue.shift();
    if (!item) break;
    autoTranslateQueuedUrls.delete(item.url);
    if (!autoTranslateActive) break;

    // Skip if already being processed
    if (translatedCache.has(item.url)) {
      applyTranslatedImage(item.img, `data:image/png;base64,${translatedCache.get(item.url)!}`, item.url);
      if (isNearViewport(item.img)) queueAutoTranslateLookahead(item.img);
      console.log('[MT] apply from cache:', item.url);
      continue;
    }

    console.log('[MT] processing:', item.url);
    autoTranslateInFlightUrls.add(item.url);
    autoTranslateConcurrent++;
    void translateAndApply(item.img, item.url).finally(() => {
      autoTranslateInFlightUrls.delete(item.url);
      autoTranslateConcurrent--;
      autoTranslateProcessing = false;
      void processAutoTranslateQueue();
    });
  }

  autoTranslateProcessing = false;
}

async function translateAndApply(img: HTMLImageElement, url: string): Promise<void> {
  console.log('[MT] translateAndApply start:', url);
  if (!autoTranslateActive) { console.log('[MT] not active, returning'); return; }

  // Check retry count
  const retries = AUTO_RETRY_MAP.get(url) ?? 0;
  if (retries >= AUTO_RETRY_MAX) { console.log('[MT] max retries reached:', url); return; }

  updateAutoTranslateCounter();

  const pageUrl = window.location.href;
  const imgData = await fetchImageData(url, pageUrl);
  if (!autoTranslateActive) return;
  if (!imgData) {
    console.log('[MT] image data unavailable:', url);
    AUTO_RETRY_MAP.set(url, retries + 1);
    return;
  }

  const settings = await loadSettings();
  const body = buildTranslateRequest(imgData, settings);

  console.log('[MT] routing translated body through background:', url);
  const result = await bgTranslateImageWithBody(url, pageUrl, body);
  if (!autoTranslateActive) return;

  if (result.error) {
    console.log('[MT] bgTranslateImage error:', result.error);
    AUTO_RETRY_MAP.set(url, retries + 1);
    return;
  }

  if (!result.translated_image) {
    console.log('[MT] no translated_image in result');
    return;
  }

  const translatedB64 = result.translated_image;
  const dataUrl = `data:image/png;base64,${translatedB64}`;

  // Cache it
  translatedCache.set(url, translatedB64);
  await saveTranslatedCacheEntry(url, translatedB64);

  // Apply to the image element on page
  applyTranslatedImage(img, dataUrl, url);
  if (isNearViewport(img)) queueAutoTranslateLookahead(img);
  console.log('[MT] applied:', url);
  updateAutoTranslateCounter();
}

function applyTranslatedImage(img: HTMLImageElement, dataUrl: string, rawUrl?: string): void {
  // Add translated marker so we don't re-process
  img.setAttribute('data-mt-translated', 'true');

  const originalUrl = rawUrl ?? resolveMangaUrl(img);
  if (originalUrl) img.setAttribute('data-mt-raw', originalUrl);

  applyTranslatedOverlay(img, dataUrl);

  // Add a subtle badge overlay
  addTranslatedBadge(img);
}

function applyTranslatedOverlay(img: HTMLImageElement, dataUrl: string): void {
  const parent = img.parentElement;
  if (!parent) {
    img.src = dataUrl;
    return;
  }

  const parentStyle = window.getComputedStyle(parent);
  if (parentStyle.position === 'static') {
    parent.style.position = 'relative';
  }

  const overlayId = getTranslatedOverlayId(img);
  let overlay = findTranslatedOverlay(parent, overlayId);
  if (!overlay) {
    overlay = document.createElement('img');
    overlay.className = 'mt-page-overlay';
    overlay.alt = '';
    overlay.setAttribute('data-mt-for', overlayId);
    overlay.setAttribute('aria-hidden', 'true');
    parent.appendChild(overlay);
  }

  overlay.src = dataUrl;
  overlay.style.position = 'absolute';
  overlay.style.zIndex = '9';
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'block';
  overlay.style.maxWidth = 'none';
  overlay.style.opacity = '1';
  syncTranslatedOverlayLayout(img, overlay);
  scheduleTranslatedDecorationSync(img);
}

function getTranslatedOverlayId(img: HTMLImageElement): string {
  const existing = img.getAttribute('data-mt-overlay-id');
  if (existing) return existing;
  translatedOverlayCounter++;
  const id = `mt-page-${translatedOverlayCounter}`;
  img.setAttribute('data-mt-overlay-id', id);
  return id;
}

function findTranslatedOverlay(parent: HTMLElement, overlayId: string): HTMLImageElement | null {
  for (const child of Array.from(parent.children)) {
    if (
      child instanceof HTMLImageElement
      && child.classList.contains('mt-page-overlay')
      && child.getAttribute('data-mt-for') === overlayId
    ) {
      return child;
    }
  }
  return null;
}

function findTranslatedBadge(parent: HTMLElement, overlayId: string): HTMLElement | null {
  for (const child of Array.from(parent.children)) {
    if (
      child instanceof HTMLElement
      && child.classList.contains('mt-badge')
      && child.getAttribute('data-mt-for') === overlayId
    ) {
      return child;
    }
  }
  return null;
}

function getImagePositionWithinParent(img: HTMLImageElement, parent: HTMLElement): DOMRect {
  const imgRect = img.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  return new DOMRect(
    imgRect.left - parentRect.left + parent.scrollLeft,
    imgRect.top - parentRect.top + parent.scrollTop,
    imgRect.width,
    imgRect.height,
  );
}

function syncTranslatedOverlayLayout(img: HTMLImageElement, overlay?: HTMLImageElement | null): void {
  const parent = img.parentElement;
  if (!parent) return;

  const overlayId = getTranslatedOverlayId(img);
  const targetOverlay = overlay ?? findTranslatedOverlay(parent, overlayId);
  if (!targetOverlay) return;

  const pos = getImagePositionWithinParent(img, parent);
  const imgStyle = window.getComputedStyle(img);
  targetOverlay.style.inset = 'auto';
  targetOverlay.style.left = `${pos.x}px`;
  targetOverlay.style.top = `${pos.y}px`;
  targetOverlay.style.width = `${pos.width}px`;
  targetOverlay.style.height = `${pos.height}px`;
  targetOverlay.style.objectFit = imgStyle.objectFit || 'fill';
  targetOverlay.style.objectPosition = imgStyle.objectPosition || '50% 50%';
}

function syncTranslatedBadgeLayout(img: HTMLImageElement, badge?: HTMLElement | null): void {
  const parent = img.parentElement;
  if (!parent) return;

  const overlayId = getTranslatedOverlayId(img);
  const targetBadge = badge ?? findTranslatedBadge(parent, overlayId);
  if (!targetBadge) return;

  const pos = getImagePositionWithinParent(img, parent);
  targetBadge.style.left = `${pos.x + pos.width - 4}px`;
  targetBadge.style.top = `${pos.y + 4}px`;
  targetBadge.style.right = 'auto';
  targetBadge.style.transform = 'translateX(-100%)';
}

function syncTranslatedDecorations(img: HTMLImageElement): void {
  syncTranslatedOverlayLayout(img);
  syncTranslatedBadgeLayout(img);
}

function scheduleTranslatedDecorationSync(img: HTMLImageElement): void {
  window.requestAnimationFrame(() => syncTranslatedDecorations(img));
  window.setTimeout(() => syncTranslatedDecorations(img), 250);
  window.setTimeout(() => syncTranslatedDecorations(img), 1000);
}

function urlsMatch(a: string | null | undefined, b: string): boolean {
  if (!a) return false;
  try {
    return new URL(a, window.location.href).href === new URL(b, window.location.href).href;
  } catch {
    return a === b;
  }
}

function applyTranslatedImageToPage(rawUrl: string, dataUrl: string): boolean {
  let applied = false;

  for (const img of document.querySelectorAll<HTMLImageElement>('img')) {
    const candidates = [
      img.getAttribute('data-mt-raw'),
      img.currentSrc,
      img.src,
      img.getAttribute('data-src'),
      img.getAttribute('data-lazy-src'),
      img.getAttribute('data-original'),
      img.getAttribute('data-lazy'),
      img.getAttribute('data-image'),
    ];
    const srcset = img.getAttribute('data-srcset');
    if (srcset) candidates.push(srcset.split(',')[0]?.trim().split(' ')[0]);

    if (!candidates.some((candidate) => urlsMatch(candidate, rawUrl))) continue;

    applyTranslatedImage(img, dataUrl, rawUrl);
    applied = true;
  }

  for (const el of document.querySelectorAll<HTMLElement>('[style*="background-image"]')) {
    const style = el.getAttribute('style') ?? '';
    const match = style.match(/url\(["']?([^"')]+)["']?\)/);
    if (!match || !urlsMatch(match[1], rawUrl)) continue;

    el.setAttribute('data-mt-raw-bg', rawUrl);
    el.style.backgroundImage = `url("${dataUrl}")`;
    applied = true;
  }

  return applied;
}

function addTranslatedBadge(img: HTMLImageElement): void {
  const parent = img.parentElement;
  if (!parent) return;

  const parentStyle = window.getComputedStyle(parent);
  if (parentStyle.position === 'static') parent.style.position = 'relative';

  const overlayId = getTranslatedOverlayId(img);
  let badge = findTranslatedBadge(parent, overlayId);
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'mt-badge';
    badge.setAttribute('data-mt-for', overlayId);
    parent.appendChild(badge);
  }

  badge.textContent = 'MT';
  badge.title = tr('translatedBadgeTitle');
  badge.style.position = 'absolute';
  badge.style.background = 'rgba(34,197,94,0.85)';
  badge.style.color = 'white';
  badge.style.fontSize = '9px';
  badge.style.fontWeight = '900';
  badge.style.padding = '1px 5px';
  badge.style.borderRadius = '4px';
  badge.style.pointerEvents = 'none';
  badge.style.zIndex = '10';
  badge.style.fontFamily = 'Inter, system-ui, sans-serif';
  syncTranslatedBadgeLayout(img, badge);
  scheduleTranslatedDecorationSync(img);
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-translate: translated cache persistence
// ─────────────────────────────────────────────────────────────────────────────

let translatedCache = new Map<string, string>(); // rawUrl -> base64 (no prefix)

function cacheStorageKey(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  return `${TRANSLATED_CACHE_PREFIX}${Math.abs(hash).toString(36)}:${url.slice(-80)}`;
}

async function loadTranslatedCache(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(null);
    const cached = result[TRANSLATED_CACHE_KEY] as Record<string, string> | undefined;
    if (cached) {
      for (const [url, b64] of Object.entries(cached)) {
        translatedCache.set(url, b64);
      }
    }

    for (const [key, value] of Object.entries(result)) {
      if (!key.startsWith(TRANSLATED_CACHE_PREFIX)) continue;
      const entry = value as { url?: string; b64?: string };
      if (entry?.url && entry?.b64) {
        translatedCache.set(entry.url, entry.b64);
      }
    }
  } catch { /* ignore */ }
}

async function saveTranslatedCacheEntry(url: string, b64: string): Promise<void> {
  try {
    await chrome.storage.local.set({ [cacheStorageKey(url)]: { url, b64 } });
  } catch { /* ignore */ }
}

async function clearTranslatedCache(): Promise<void> {
  translatedCache = new Map();
  try {
    const all = await chrome.storage.local.get(null);
    const keys = Object.keys(all).filter((key) => key === TRANSLATED_CACHE_KEY || key.startsWith(TRANSLATED_CACHE_PREFIX));
    if (keys.length > 0) await chrome.storage.local.remove(keys);
  } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-translate: floating UI
// ─────────────────────────────────────────────────────────────────────────────

let autoTranslateRoot: HTMLElement | null = null;

function injectAutoTranslateUI(): void {
  if (autoTranslateRoot) return;
  autoTranslateRoot = document.createElement('div');
  autoTranslateRoot.id = 'mt-auto-root';
  autoTranslateRoot.innerHTML = `
    <div class="mt-auto-indicator">
      <div class="mt-auto-dot"></div>
      <span class="mt-auto-label">${tr('autoMt')}</span>
      <span class="mt-auto-count" id="mt-auto-count">0</span>
      <button class="mt-auto-stop" id="mt-auto-stop">${tr('stop')}</button>
    </div>
  `;
  document.body.appendChild(autoTranslateRoot);

  const stopBtn = document.getElementById('mt-auto-stop');
  stopBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    stopAutoTranslate();
  }, true);

  const style = document.createElement('style');
  style.id = 'mt-auto-style';
  style.textContent = `
    #mt-auto-root {
      position: fixed; bottom: 24px; right: 24px; z-index: 2147483646;
      font-family: Inter, system-ui, sans-serif;
      pointer-events: auto;
    }
    .mt-auto-indicator {
      display: flex; align-items: center; gap: 8px;
      background: rgba(6,10,24,0.96); border: 1px solid rgba(59,130,246,0.25);
      border-radius: 99px; padding: 8px 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      color: #dde6f5; font-size: 12px; font-weight: 700;
    }
    .mt-auto-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #22c55e; animation: mt-pulse 1.5s ease-in-out infinite;
    }
    .mt-auto-indicator.stopped .mt-auto-dot { background: #6b7fa8; animation: none; }
    .mt-auto-indicator.stopped { border-color: rgba(60,80,160,0.15); }
    @keyframes mt-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    .mt-auto-label { color: #60a5fa; }
    .mt-auto-count { color: #4ade80; min-width: 24px; }
    .mt-auto-stop {
      background: rgba(220,38,38,0.15); color: #f87171;
      border: 1px solid rgba(220,38,38,0.3);
      border-radius: 99px; padding: 2px 10px;
      font-size: 11px; font-weight: 700; cursor: pointer;
      font-family: Inter, system-ui, sans-serif;
      pointer-events: auto;
    }
    .mt-auto-stop:hover { background: rgba(220,38,38,0.25); }
    .mt-badge {
      position: absolute; top: 4px; right: 4px;
      background: rgba(34,197,94,0.85); color: white;
      font-size: 9px; font-weight: 900; padding: 1px 5px;
      border-radius: 4px; pointer-events: none; z-index: 10;
      font-family: Inter, system-ui, sans-serif;
    }
    .mt-page-overlay {
      display: block !important;
      max-width: none !important;
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
}

function removeAutoTranslateUI(): void {
  autoTranslateRoot?.remove();
  autoTranslateRoot = null;
  document.getElementById('mt-auto-style')?.remove();
}

function updateAutoTranslateIndicator(state: 'active' | 'stopped'): void {
  const indicator = document.querySelector('.mt-auto-indicator');
  if (!indicator) return;
  if (state === 'stopped') indicator.classList.add('stopped');
  else indicator.classList.remove('stopped');

  const label = indicator.querySelector('.mt-auto-label');
  if (label) label.textContent = state === 'stopped' ? tr('autoMtDone') : tr('autoMt');
}

function updateAutoTranslateCounter(): void {
  const countEl = document.getElementById('mt-auto-count');
  if (countEl) countEl.textContent = String(translatedCache.size);
}

// ─────────────────────────────────────────────────────────────────────────────
// Background helpers (bypass CORS)
// ─────────────────────────────────────────────────────────────────────────────

function bgTranslateImageWithBody(imageUrl: string, pageUrl: string, body: TranslateRequest): Promise<{ translated_image?: string; bubbles?: unknown[]; processing_time_seconds?: number; error?: string }> {
  return new Promise((resolve) => {
    const tid = setTimeout(() => resolve({ error: 'Backend timeout after 5 minutes' }), 300_000);
    chrome.runtime.sendMessage({ type: 'TRANSLATE_IMAGE_WITH_BODY', imageUrl, pageUrl, body }, (resp: unknown) => {
      clearTimeout(tid);
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        resolve({ error: `extension error: ${lastError.message}` });
        return;
      }
      resolve((resp as { translated_image?: string; bubbles?: unknown[]; processing_time_seconds?: number; error?: string }) ?? { error: 'no response' });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Scanner entry
// ─────────────────────────────────────────────────────────────────────────────

async function openScanner(): Promise<void> {
  await refreshUiLanguage();
  closeScanner(false);

  scannerPausedAutoTranslate = autoTranslateActive;
  if (scannerPausedAutoTranslate) {
    stopAutoTranslate(true);
  }

  const pages = collectAllImages();
  if (pages.length === 0) {
    if (scannerPausedAutoTranslate) {
      scannerPausedAutoTranslate = false;
      void startAutoTranslate();
    }
    toast(tr('noMangaImagesPage'), true);
    return;
  }

  seenUrls = new Set(pages.map((p) => p.rawUrl));
  imageCache = new Map();
  currentPages = pages;
  totalChapterPages = pages.length;

  // Rehydrate from translated cache
  await loadTranslatedCache();
  for (const [url, b64] of translatedCache) {
    if (!imageCache.has(url)) {
      imageCache.set(url, `data:image/png;base64,${b64}`);
    }
  }

  const container = createScannerRoot();
  currentShadow = container.attachShadow({ mode: 'closed' });

  currentShadow.innerHTML = buildScannerHTML();
  injectStyles(currentShadow);
  bindScanner(currentShadow);
  mountScannerRoot(container);

  void loadThumbnailsInBackground();
}

// ─────────────────────────────────────────────────────────────────────────────
// Background fetch
// ─────────────────────────────────────────────────────────────────────────────

function bgFetchImage(url: string, pageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(url), 5000);
    chrome.runtime.sendMessage(
      { type: 'FETCH_IMAGE', url, pageUrl },
      (response: unknown) => {
        clearTimeout(timeout);
        const resp = response as { base64?: string; error?: string } | null;
        if (resp?.base64) resolve(`data:image/jpeg;base64,${resp.base64}`);
        else resolve(url);
      },
    );
  });
}

async function loadThumbnailsInBackground(): Promise<void> {
  if (!currentShadow) return;
  const pageUrl = window.location.href;
  for (const page of currentPages) {
    if (!currentShadow) break;
    if (imageCache.has(page.rawUrl)) continue;
    const card = currentShadow.querySelector<HTMLElement>(`.mts-card[data-index="${page.index}"]`);
    if (!card) continue;
    const thumb = await bgFetchImage(page.rawUrl, pageUrl);
    imageCache.set(page.rawUrl, thumb);
    const img = card.querySelector<HTMLImageElement>('.mts-thumb');
    if (img && !card.classList.contains('selected')) {
      img.src = thumb;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Image collection
// ─────────────────────────────────────────────────────────────────────────────

function resolveLazySrc(img: HTMLImageElement): string | null {
  return resolveLazyAttributeSrc(img) ?? (isUsableImageUrl(img.currentSrc || img.src) ? (img.currentSrc || img.src) : null);
}

function collectAllImages(): PageEntry[] {
  const pages: PageEntry[] = [];

  const imgs = document.querySelectorAll<HTMLImageElement>('img');
  for (const img of imgs) {
    const thumb = resolveLazySrc(img);
    if (!thumb) continue;
    if (thumb.startsWith('data:') || thumb.startsWith('blob:')) continue;

    const w = img.naturalWidth || (img.getAttribute('width') ? Number(img.getAttribute('width')) : 0);
    const h = img.naturalHeight || (img.getAttribute('height') ? Number(img.getAttribute('height')) : 0);
    const renderedW = img.getBoundingClientRect().width;
    if (w > 0 && h > 0 && (w < 120 || h < 80)) continue;
    if (w === 0 && h === 0 && renderedW > 0 && renderedW < 120) continue;

    img.setAttribute('data-mt-raw', thumb);
    pages.push({ index: pages.length, thumb, rawUrl: thumb, fetched: true });
  }

  const bgElements = document.querySelectorAll<HTMLElement>('[style*="background-image"]');
  for (const el of bgElements) {
    const style = el.getAttribute('style') ?? '';
    const match = style.match(/url\(["']?([^"')]+)["']?\)/);
    if (!match) continue;
    const thumb = match[1];
    if (!thumb || thumb === 'none' || thumb.startsWith('data:') || thumb.startsWith('blob:')) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 80) continue;
    pages.push({ index: pages.length, thumb, rawUrl: thumb, fetched: true });
  }

  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML builder
// ─────────────────────────────────────────────────────────────────────────────

function buildScannerHTML(): string {
  const cards = currentPages.map((p) => {
    const src = imageCache.get(p.rawUrl) ?? p.thumb;
    const wasTranslated = translatedCache.has(p.rawUrl);
    return `
      <button class="mts-card${p.fetched ? '' : ' fetched-late'}${wasTranslated ? ' translated-cached' : ''}" data-index="${p.index}" type="button">
        <img class="mts-thumb" src="${src}" alt="${tr('pageAlt', { page: p.index + 1 })}" loading="lazy" />
        <div class="mts-card-num">${p.index + 1}</div>
        <div class="mts-check">&#x2713;</div>
        <div class="mts-card-status"></div>
        ${wasTranslated ? '<div class="mts-badge">MT</div>' : ''}
      </button>
    `;
  }).join('');

  const totalLabel = totalChapterPages > 0 ? ` / ${totalChapterPages}` : '';

  return `
    <div class="mts-backdrop"></div>
    <div class="mts-box">
      <div class="mts-box-header">
        <div class="mts-title">MangaTranslator</div>
        <div class="mts-header-row">
          <span class="mts-found-count" id="mts-found-count">${seenUrls.size}${totalLabel} ${tr('pagesLabel')}</span>
          <div class="mts-header-actions">
            <button class="mts-btn-toolbar" data-action="select-all">${tr('all')}</button>
            <button class="mts-btn-toolbar" data-action="deselect-all">${tr('none')}</button>
            <button class="mts-btn-close" data-action="close" type="button" title="${tr('close')}">&#x2715;</button>
          </div>
        </div>
      </div>
      <div class="mts-auto-bar">
        <div class="mts-auto-info" id="mts-auto-info">${tr('foundImagesOnPage', { count: currentPages.length })}</div>
        <button class="mts-btn-toolbar mts-btn-collect" data-action="auto-collect">${tr('autoCollect')}</button>
        <button class="mts-btn-toolbar mts-btn-stop" data-action="stop-collect" style="display:none">${tr('stop')}</button>
        <div class="mts-auto-spinner" id="mts-auto-spinner" style="display:none"></div>
      </div>
      <div class="mts-toolbar">
        <span class="mts-count" id="mts-count">0 / ${currentPages.length}</span>
        <button class="mts-btn-toolbar" data-action="cancel" id="mts-cancel-btn" style="display:none">${tr('cancel')}</button>
        <button class="mts-btn-primary mts-btn-translate" data-action="translate" disabled>${tr('translate')}</button>
      </div>
      <div class="mts-grid">${cards}</div>
    </div>
  `;
}

function reRenderGrid(): void {
  if (!currentShadow) return;
  const grid = currentShadow.querySelector<HTMLElement>('.mts-grid');
  const countEl = currentShadow.querySelector<HTMLElement>('#mts-count');
  const foundCountEl = currentShadow.querySelector<HTMLElement>('#mts-found-count');
  const totalLabel = totalChapterPages > 0 ? ` / ${totalChapterPages}` : '';

  if (grid) {
    grid.innerHTML = currentPages.map((p) => {
      const src = imageCache.get(p.rawUrl) ?? p.thumb;
      const wasTranslated = translatedCache.has(p.rawUrl);
      return `
        <button class="mts-card${p.fetched ? '' : ' fetched-late'}${wasTranslated ? ' translated-cached' : ''}" data-index="${p.index}" type="button">
          <img class="mts-thumb" src="${src}" alt="${tr('pageAlt', { page: p.index + 1 })}" loading="lazy" />
          <div class="mts-card-num">${p.index + 1}</div>
          <div class="mts-check">&#x2713;</div>
          <div class="mts-card-status"></div>
          ${wasTranslated ? '<div class="mts-badge">MT</div>' : ''}
        </button>
      `;
    }).join('');
  }

  if (countEl) {
    const sel = currentShadow.querySelectorAll<HTMLElement>('.mts-card.selected');
    countEl.textContent = `${sel.length} / ${currentPages.length}`;
  }
  if (foundCountEl) {
    foundCountEl.textContent = `${seenUrls.size}${totalLabel} ${tr('pagesLabel')}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding
// ─────────────────────────────────────────────────────────────────────────────

function bindScanner(shadow: ShadowRoot): void {
  const selected = new Set<number>();
  const grid = shadow.querySelector<HTMLElement>('.mts-grid')!;
  const countEl = shadow.querySelector<HTMLElement>('#mts-count')!;
  const translateBtn = shadow.querySelector<HTMLButtonElement>('[data-action="translate"]')!;
  const cancelBtn = shadow.querySelector<HTMLButtonElement>('#mts-cancel-btn')!;
  const closeBtn = shadow.querySelector<HTMLButtonElement>('[data-action="close"]')!;
  const backdrop = shadow.querySelector<HTMLElement>('.mts-backdrop')!;
  const selectAllBtn = shadow.querySelector<HTMLButtonElement>('[data-action="select-all"]')!;
  const deselectAllBtn = shadow.querySelector<HTMLButtonElement>('[data-action="deselect-all"]')!;
  const autoCollectBtn = shadow.querySelector<HTMLButtonElement>('[data-action="auto-collect"]')!;
  const stopCollectBtn = shadow.querySelector<HTMLButtonElement>('[data-action="stop-collect"]')!;
  const autoInfo = shadow.querySelector<HTMLElement>('#mts-auto-info')!;
  const autoSpinner = shadow.querySelector<HTMLElement>('#mts-auto-spinner')!;

  const refresh = () => {
    countEl.textContent = `${selected.size} / ${currentPages.length}`;
    translateBtn.disabled = selected.size === 0;
  };

  grid.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.mts-card');
    if (!card) return;
    const idx = Number(card.dataset.index);
    if (selected.has(idx)) { selected.delete(idx); card.classList.remove('selected'); }
    else { selected.add(idx); card.classList.add('selected'); }
    refresh();
  });

  selectAllBtn.addEventListener('click', () => {
    currentPages.forEach((p) => selected.add(p.index));
    shadow.querySelectorAll<HTMLElement>('.mts-card').forEach((c) => c.classList.add('selected'));
    refresh();
  });

  deselectAllBtn.addEventListener('click', () => {
    selected.clear();
    shadow.querySelectorAll<HTMLElement>('.mts-card').forEach((c) => c.classList.remove('selected'));
    refresh();
  });

  backdrop.addEventListener('click', () => closeScanner());
  closeBtn.addEventListener('click', () => closeScanner());

  autoCollectBtn.addEventListener('click', async () => {
    autoCollectBtn.style.display = 'none';
    stopCollectBtn.style.display = '';
    autoSpinner.style.display = 'block';
    autoInfo.textContent = tr('starting');
    await autoCollect((status) => { autoInfo.textContent = status; reRenderGrid(); });

    autoSpinner.style.display = 'none';
    stopCollectBtn.style.display = 'none';
    autoCollectBtn.style.display = '';

    void loadThumbnailsInBackground();
  });

  stopCollectBtn.addEventListener('click', () => { abortCollect = true; });

  translateBtn.addEventListener('click', async () => {
    const chosen = Array.from(selected).map((i) => currentPages[i]);
    if (chosen.length === 0) return;

    translateBtn.style.display = 'none';
    selectAllBtn.style.display = 'none';
    deselectAllBtn.style.display = 'none';
    closeBtn.style.display = 'none';
    autoCollectBtn.style.display = 'none';
    stopCollectBtn.style.display = 'none';
    cancelBtn.style.display = '';
    backdrop.style.pointerEvents = 'none';

    abortTranslate = false;
    let success = 0;

    for (let i = 0; i < chosen.length; i++) {
      if (abortTranslate) {
        toast(tr('cancelledTranslated', { success, total: i }), false);
        break;
      }

      const page = chosen[i];
      const card = shadow.querySelector<HTMLElement>(`.mts-card[data-index="${page.index}"]`);
      const statusEl = card?.querySelector<HTMLElement>('.mts-card-status') ?? null;

      translateBtn.textContent = `${i + 1} / ${chosen.length}`;
      card?.classList.add('translating');
      if (statusEl) { statusEl.className = 'mts-card-status translating'; statusEl.textContent = '…'; }

      const ok = await translateOne(page, statusEl);

      card?.classList.remove('translating');
      if (ok) {
        card?.classList.add('done');
        const wasTranslated = translatedCache.has(page.rawUrl);
        if (!wasTranslated) {
          const imgEl = card?.querySelector<HTMLImageElement>('.mts-thumb');
          if (imgEl) {
            translatedCache.set(page.rawUrl, imgEl.src.replace(/^data:image\/\w+;base64,/, ''));
            await saveTranslatedCacheEntry(page.rawUrl, imgEl.src.replace(/^data:image\/\w+;base64,/, ''));
          }
        }
        success++;
      } else {
        card?.classList.add('failed');
      }
    }

    if (!abortTranslate) {
      toast(
        success === chosen.length
          ? tr('allImagesTranslated', { count: success })
          : tr('partialTranslated', { success, total: chosen.length }),
        success === 0,
      );
    }

    setTimeout(closeScanner, 2500);
  });

  cancelBtn.addEventListener('click', () => { abortTranslate = true; });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeScanner();
    if (e.key === 'Enter' && !translateBtn.disabled) translateBtn.click();
  });

  refresh();
}

// ─────────────────────────────────────────────────────────────────────────────
// Translation
// ─────────────────────────────────────────────────────────────────────────────

async function autoCollect(onProgress: (status: string) => void): Promise<void> {
  abortCollect = false;
  onProgress(tr('scanningPage'));

  const pages = collectAllImages();
  if (pages.length === 0) {
    onProgress(tr('noImagesFoundOnPage'));
    return;
  }

  let added = 0;
  for (const page of pages) {
    if (abortCollect) break;
    if (seenUrls.has(page.rawUrl)) continue;
    seenUrls.add(page.rawUrl);
    currentPages.push({ index: currentPages.length, thumb: page.thumb, rawUrl: page.rawUrl, fetched: true });
    added++;
    if (added % 10 === 0) {
      onProgress(tr('foundImages', { count: seenUrls.size }));
      reRenderGrid();
    }
  }

  totalChapterPages = seenUrls.size;
  onProgress(tr('foundMangaImages', { count: seenUrls.size }));
  reRenderGrid();
}

function buildTranslateRequest(image: string, settings: AppSettings): TranslateRequest {
  return {
    image,
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
}

async function translateOne(page: PageEntry, statusEl: HTMLElement | null): Promise<boolean> {
  const settings = await loadSettings();

  // Check cache first
  if (translatedCache.has(page.rawUrl)) {
    const cached = translatedCache.get(page.rawUrl)!;
    const dataUrl = `data:image/png;base64,${cached}`;
    imageCache.set(page.rawUrl, dataUrl);
    applyTranslatedImageToPage(page.rawUrl, dataUrl);
    if (currentShadow) {
      const card = currentShadow.querySelector<HTMLElement>(`.mts-card[data-index="${page.index}"]`);
      const img = card?.querySelector<HTMLImageElement>('.mts-thumb');
      if (img) img.src = dataUrl;
    }
    if (statusEl) { statusEl.textContent = tr('cached'); statusEl.className = 'mts-card-status done'; }
    return true;
  }

  let imgData: string | null = null;

  // fetchImageData tries DOM capture first (uses browser's cached/authed image),
  // then background fetch, then direct CORS fetch
  imgData = await fetchImageData(page.rawUrl, window.location.href);

  if (!imgData) {
    if (statusEl) { statusEl.textContent = tr('loadError'); statusEl.className = 'mts-card-status failed'; }
    return false;
  }

  const backendUrl = settings.backendUrl || DEFAULT_BACKEND_URL;
  // endpoint kept for reference; translation now routes through background
  void backendUrl;

  if (statusEl) { statusEl.textContent = tr('sending'); statusEl.className = 'mts-card-status translating'; }

  const body = buildTranslateRequest(imgData, settings);

  try {
    if (statusEl) statusEl.textContent = tr('translating');
    // Route through background to bypass CORS; pass page URL for correct Referer header
    const result = await bgTranslateImageWithBody(page.rawUrl, window.location.href, body);
    if (result.error) {
      if (statusEl) { statusEl.textContent = result.error; statusEl.className = 'mts-card-status failed'; }
      return false;
    }
    if (!result.translated_image) {
      if (statusEl) { statusEl.textContent = tr('noResult'); statusEl.className = 'mts-card-status failed'; }
      return false;
    }

    const translatedB64 = result.translated_image;
    const translatedDataUrl = `data:image/png;base64,${translatedB64}`;
    imageCache.set(page.rawUrl, translatedDataUrl);

    translatedCache.set(page.rawUrl, translatedB64);
    await saveTranslatedCacheEntry(page.rawUrl, translatedB64);
    applyTranslatedImageToPage(page.rawUrl, translatedDataUrl);

    if (currentShadow) {
      const card = currentShadow.querySelector<HTMLElement>(`.mts-card[data-index="${page.index}"]`);
      const img = card?.querySelector<HTMLImageElement>('.mts-thumb');
      if (img) img.src = translatedDataUrl;
    }

    const bubbles = result.bubbles?.length ?? 0;
    const time = result.processing_time_seconds?.toFixed(1) ?? '?';
    if (statusEl) {
      statusEl.textContent = bubbles > 0 ? tr('bubbles', { count: bubbles, time }) : tr('doneWithTime', { time });
      statusEl.className = 'mts-card-status done';
    }
    return true;

  } catch {
    if (statusEl) { statusEl.textContent = tr('networkError'); statusEl.className = 'mts-card-status failed'; }
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Image capture / fetch
// ─────────────────────────────────────────────────────────────────────────────

function captureImgElement(img: HTMLImageElement): string | null {
  try {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (w === 0 || h === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '');
  } catch { return null; }
}

async function fetchImageData(url: string, pageUrl: string): Promise<string | null> {
  // 1. Try to capture from DOM — uses browser's cached/authorized image, no fetch needed
  try {
    const domImg = document.querySelector<HTMLImageElement>(
      `img[src="${url}"], img[data-mt-raw="${url}"]`,
    );
    if (domImg) {
      const captured = captureImgElement(domImg);
      if (captured) return captured;
    }
  } catch { /* fall through */ }

  // 2. Direct fetch from content script — uses page cookies/auth (unlike service worker)
  const captured = await fetchImageWithAuth(url);
  if (captured) return captured;

  // 3. Background fetch as fallback
  try {
    const result = await new Promise<string>((resolve) => {
      const tid = setTimeout(() => resolve(''), 6000);
      chrome.runtime.sendMessage({ type: 'FETCH_IMAGE', url, pageUrl }, (resp: unknown) => {
        clearTimeout(tid);
        const r = resp as { base64?: string } | null;
        resolve(r?.base64 ? `data:image/jpeg;base64,${r.base64}` : '');
      });
    });
    if (result) return result.replace(/^data:image\/\w+;base64,/, '');
  } catch { /* fall through */ }

  return null;
}

/** Fetch image from content script — inherits page cookies/auth unlike service worker. */
async function fetchImageWithAuth(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Origin': window.location.origin,
      },
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const fr = new FileReader();
      fr.onloadend = () => resolve((fr.result as string).replace(/^data:image\/\w+;base64,/, ''));
      fr.onerror = () => resolve('');
      fr.readAsDataURL(blob);
    });
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────────────────────────────────────

async function loadSettings(): Promise<AppSettings> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return normalizeSettings(result[STORAGE_KEY] as Partial<AppSettings> | undefined);
  } catch { return getDefaultSettings(); }
}

function normalizeSettings(raw?: Partial<AppSettings>): AppSettings {
  return {
    ...getDefaultSettings(),
    ...(raw ?? {}),
    uiLanguage: normalizeUiLanguage(raw?.uiLanguage),
    config: {
      ...getDefaultSettings().config,
      ...(raw?.config ?? {}),
    },
  };
}

function getDefaultSettings(): AppSettings {
  return {
    backendUrl: DEFAULT_BACKEND_URL,
    autoDetect: false,
    showBubbleBboxes: false,
    uiLanguage: 'en',
    config: {
      inputLanguage: 'Japanese',
      outputLanguage: 'English',
      provider: 'Google',
      temperature: 0.1,
      topP: 0.95,
      topK: 1,
      translationMode: 'one-step',
      ocrMethod: 'LLM',
      maxFontSize: 16,
      minFontSize: 8,
      supersamplingFactor: 4,
      sendFullPageContext: true,
      imageDetail: 'auto',
      outsideTextEnabled: false,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Overlay management
// ─────────────────────────────────────────────────────────────────────────────

function closeScanner(resumeAutoTranslate = true): void {
  abortCollect = true;
  abortTranslate = true;
  const shouldResumeAutoTranslate = resumeAutoTranslate && scannerPausedAutoTranslate;
  scannerPausedAutoTranslate = false;

  const root = document.getElementById(ROOT_ID);
  if (root) root.remove();

  currentShadow = null;
  seenUrls = new Set();
  imageCache = new Map();
  currentPages = [];
  totalChapterPages = 0;

  if (shouldResumeAutoTranslate && !autoTranslateActive) {
    void startAutoTranslate();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function createScannerRoot(): HTMLElement {
  const container = document.createElement('div');
  container.id = ROOT_ID;
  container.setAttribute('popover', 'manual');
  applyScannerRootStyles(container);
  return container;
}

function mountScannerRoot(container: HTMLElement): void {
  applyScannerRootStyles(container);
  (document.documentElement || document.body).appendChild(container);

  const popoverHost = container as HTMLElement & { showPopover?: () => void };
  if (typeof popoverHost.showPopover === 'function') {
    try {
      popoverHost.showPopover();
      applyScannerRootStyles(container);
    } catch {
      // Some pages or browser versions can reject popover; fixed max z-index is the fallback.
    }
  }
}

function applyScannerRootStyles(container: HTMLElement): void {
  container.style.all = 'initial';
  container.style.display = 'block';
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.maxWidth = 'none';
  container.style.maxHeight = 'none';
  container.style.margin = '0';
  container.style.padding = '0';
  container.style.border = '0';
  container.style.background = 'transparent';
  container.style.overflow = 'hidden';
  container.style.zIndex = '2147483647';
  container.style.isolation = 'isolate';
  container.style.contain = 'layout style paint';
  container.style.pointerEvents = 'auto';
}

function toast(message: string, isError = false): void {
  const existing = document.getElementById('mt-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'mt-toast';
  el.className = `mt-toast${isError ? ' error' : ''}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

function injectStyles(shadow: ShadowRoot): void {
  if (shadow.querySelector('#' + STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    :host, :host([popover]) {
      all: initial !important;
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      display: block !important;
      overflow: hidden !important;
      pointer-events: auto !important;
      isolation: isolate !important;
      contain: layout style paint !important;
    }
    :host::backdrop { background: transparent !important; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; }
    button, img { all: unset; box-sizing: border-box; }
    button { cursor: pointer; }
    .mts-backdrop {
      position: fixed; inset: 0; z-index: 0;
      background: rgba(2,4,16,0.65); backdrop-filter: blur(4px);
      pointer-events: auto;
    }
    .mts-box {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
      z-index: 1;
      width: min(1100px, calc(100vw - 48px)); max-height: calc(100vh - 48px);
      display: flex; flex-direction: column;
      background: #080b18; border: 1px solid rgba(80,100,200,0.2);
      border-radius: 20px; overflow: hidden; box-shadow: 0 40px 120px rgba(0,0,0,0.65);
    }
    .mts-box-header {
      padding: 16px 18px 12px; background: rgba(10,15,38,0.98);
      border-bottom: 1px solid rgba(80,100,200,0.1); flex-shrink: 0;
    }
    .mts-title {
      font-size: 18px; font-weight: 800;
      background: linear-gradient(135deg, #60a5fa, #818cf8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; margin-bottom: 8px;
    }
    .mts-header-row { display: flex; align-items: center; justify-content: space-between; }
    .mts-found-count { font-size: 12px; color: #4a5e8a; }
    .mts-header-actions { display: flex; gap: 6px; align-items: center; }
    .mts-auto-bar {
      display: flex; align-items: center; gap: 10px; padding: 10px 18px;
      background: rgba(14,22,50,0.96);
      border-bottom: 1px solid rgba(80,100,200,0.08); flex-shrink: 0;
    }
    .mts-auto-info {
      font-size: 12px; color: #6b7fa8; flex: 1;
      min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .mts-auto-spinner {
      width: 14px; height: 14px; flex-shrink: 0;
      border: 2px solid rgba(80,120,255,0.3); border-top-color: #60a5fa;
      border-radius: 50%; animation: mt-spin 0.7s linear infinite;
    }
    @keyframes mt-spin { to { transform: rotate(360deg); } }
    .mts-toolbar {
      display: flex; align-items: center; gap: 10px; padding: 10px 18px;
      background: rgba(10,14,32,0.96);
      border-bottom: 1px solid rgba(80,100,200,0.08); flex-shrink: 0;
    }
    .mts-count { font-size: 13px; font-weight: 700; color: #6b7fa8; margin-right: auto; }
    .mts-grid {
      flex: 1; overflow-y: auto; overflow-x: hidden; padding: 14px;
      display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px;
      background: #050710;
    }
    .mts-grid::-webkit-scrollbar { width: 5px; }
    .mts-grid::-webkit-scrollbar-track { background: transparent; }
    .mts-grid::-webkit-scrollbar-thumb { background: rgba(80,100,200,0.25); border-radius: 99px; }
    .mts-card {
      position: relative; display: flex; flex-direction: column;
      border: 2px solid rgba(60,80,160,0.12); border-radius: 12px; overflow: hidden;
      cursor: pointer; background: #0a0e1e;
      color: inherit; text-align: left; appearance: none;
      transition: border-color 0.15s, transform 0.1s;
    }
    .mts-card:hover { border-color: rgba(80,120,255,0.45); transform: translateY(-2px); }
    .mts-card.selected { border-color: #4f8ff7; }
    .mts-card.translating { opacity: 0.55; }
    .mts-card.done { border-color: #16a34a; opacity: 0.75; }
    .mts-card.failed { border-color: #dc2626; opacity: 0.65; }
    .mts-card.fetched-late { border-color: rgba(80,180,120,0.35); }
    .mts-card.translated-cached { border-color: rgba(34,197,94,0.4); }
    .mts-thumb { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; background: #0d1428; }
    .mts-card-num {
      position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.7);
      color: #c0d0f0; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px;
    }
    .mts-check {
      display: none; position: absolute; top: 6px; right: 6px;
      width: 22px; height: 22px; border-radius: 999px;
      background: #2563eb; color: white; font-size: 12px; font-weight: 900;
      align-items: center; justify-content: center;
    }
    .mts-card.selected .mts-check { display: flex; }
    .mts-card-status { display: none; font-size: 10px; font-weight: 700; padding: 3px 7px; background: rgba(0,0,0,0.75); }
    .mts-card.translating .mts-card-status { display: block; color: #93c5fd; }
    .mts-card.done .mts-card-status { display: block; color: #86efac; }
    .mts-card.failed .mts-card-status { display: block; color: #fca5a5; }
    .mts-badge {
      position: absolute; bottom: 6px; right: 6px;
      background: rgba(34,197,94,0.85); color: white;
      font-size: 9px; font-weight: 900; padding: 1px 5px; border-radius: 4px;
    }
    .mts-btn-toolbar, .mts-btn-primary, .mts-btn-close {
      display: inline-flex; align-items: center; justify-content: center;
      border: none; border-radius: 9px; cursor: pointer; font-weight: 700;
      font-family: Inter, system-ui, sans-serif;
    }
    .mts-btn-toolbar {
      background: rgba(14,22,50,0.9); color: #7a90b8; font-size: 12px; padding: 6px 11px;
      border: 1px solid rgba(60,80,160,0.15);
    }
    .mts-btn-toolbar:hover { background: rgba(24,38,80,0.9); color: #a0b8d8; }
    .mts-btn-collect {
      background: rgba(10,40,80,0.9); color: #60a5fa;
      border: 1px solid rgba(60,120,255,0.2);
    }
    .mts-btn-collect:hover { background: rgba(20,60,140,0.9); color: #93c5fd; }
    .mts-btn-close {
      background: rgba(20,30,60,0.9); color: #5a6e90;
      font-size: 16px; width: 30px; height: 30px; padding: 0; line-height: 1;
      border: 1px solid rgba(60,80,160,0.15);
    }
    .mts-btn-close:hover { background: rgba(40,60,120,0.9); color: #fff; }
    .mts-btn-primary {
      background: linear-gradient(135deg, #3b82f6, #6366f1); color: white;
      font-size: 13px; padding: 9px 16px; box-shadow: 0 4px 14px rgba(59,130,246,0.22);
    }
    .mts-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
    .mt-toast {
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
      z-index: 2147483647; padding: 11px 20px; border-radius: 12px;
      background: rgba(8,12,28,0.97); color: #dde6f5; font: 600 13px Inter, system-ui, sans-serif;
      border: 1px solid rgba(80,110,200,0.22); box-shadow: 0 8px 30px rgba(0,0,0,0.4); white-space: nowrap;
    }
    .mt-toast.error { background: rgba(50,10,10,0.97); border-color: rgba(220,50,50,0.22); color: #fca5a5; }
  `;
  shadow.appendChild(s);
}
