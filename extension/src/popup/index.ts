import { DEFAULT_SETTINGS, SOURCE_LANGUAGES, TARGET_LANGUAGES, type AppSettings } from '../shared/types.js';
import { UI_LANGUAGES, languageLabel, normalizeUiLanguage, t, type I18nKey, type UiLanguage } from '../shared/i18n.js';

const STORAGE_KEY = 'manga_translator_settings';

type StoredSettings = Partial<Omit<AppSettings, 'config'>> & {
  config?: Partial<AppSettings['config']>;
};

type HealthState = 'checking' | 'ok' | 'error' | 'offline';

function qs<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id) as T;
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

const backendInput = qs<HTMLInputElement>('f-backend');
const sourceSelect = qs<HTMLSelectElement>('f-source');
const targetSelect = qs<HTMLSelectElement>('f-target');
const outsideTextToggle = qs<HTMLInputElement>('f-outside-text');
const scanBtn = qs<HTMLButtonElement>('btn-scan');
const autoBtn = qs<HTMLButtonElement>('btn-auto');
const saveBtn = qs<HTMLButtonElement>('btn-save');
const saveConfigBtn = qs<HTMLButtonElement>('btn-save-config');
const clearCacheBtn = qs<HTMLButtonElement>('btn-clear-cache');

const llmProviderSelect = qs<HTMLSelectElement>('f-llm-provider');
const baseUrlInput = qs<HTMLInputElement>('f-base-url');
const llmApiKeyInput = qs<HTMLInputElement>('f-llm-apikey');
const fetchModelsBtn = qs<HTMLButtonElement>('btn-fetch-models');
const modelPickerWrap = qs<HTMLDivElement>('model-picker-wrap');
const modelInput = qs<HTMLInputElement>('f-model');
const modelLoading = qs<HTMLDivElement>('model-loading');
const modelError = qs<HTMLDivElement>('model-error');
const modelHint = qs<HTMLDivElement>('model-hint');
const tempSlider = qs<HTMLInputElement>('f-temp');
const topPSlider = qs<HTMLInputElement>('f-topp');
const topKSlider = qs<HTMLInputElement>('f-topk');
const tempVal = qs<HTMLSpanElement>('val-temp');
const topPVal = qs<HTMLSpanElement>('val-topp');
const topKVal = qs<HTMLSpanElement>('val-topk');
const contextToggle = qs<HTMLInputElement>('f-context');
const instructionsInput = qs<HTMLTextAreaElement>('f-instructions');
const saveLlmBtn = qs<HTMLButtonElement>('btn-save-llm');
const uiLanguageSelect = qs<HTMLSelectElement>('f-ui-language');

const healthBadge = qs<HTMLSpanElement>('health-badge');
const statusEl = qs<HTMLDivElement>('popup-status');
const urlDisplay = qs<HTMLDivElement>('backend-url-display');

let settings: AppSettings = normalizeSettings();
let uiLanguage: UiLanguage = 'en';
let healthState: HealthState = 'checking';
let isBound = false;

function normalizeSettings(raw?: StoredSettings): AppSettings {
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

function populateSelect(el: HTMLSelectElement, options: readonly string[], selected: string): void {
  el.replaceChildren();
  for (const optionValue of options) {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = languageLabel(uiLanguage, optionValue);
    option.selected = optionValue === selected;
    el.appendChild(option);
  }
}

function populateUiLanguageSelect(selected: UiLanguage): void {
  uiLanguageSelect.replaceChildren();
  for (const language of UI_LANGUAGES) {
    const option = document.createElement('option');
    option.value = language.code;
    option.textContent = `${language.nativeName} (${language.name})`;
    option.selected = language.code === selected;
    uiLanguageSelect.appendChild(option);
  }
}

function renderLanguageSelects(): void {
  populateSelect(sourceSelect, SOURCE_LANGUAGES, settings.config.inputLanguage);
  populateSelect(targetSelect, TARGET_LANGUAGES, settings.config.outputLanguage);
}

function applyI18n(): void {
  document.documentElement.lang = uiLanguage;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as I18nKey | undefined;
    if (key) el.textContent = t(uiLanguage, key);
  });
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder as I18nKey | undefined;
    if (key) el.placeholder = t(uiLanguage, key);
  });
  setHealthState(healthState);
  setAutoButtonState(autoBtn.classList.contains('active'));
}

function setHealthState(state: HealthState): void {
  healthState = state;
  healthBadge.className = state === 'ok' ? 'health-badge ok' : state === 'checking' ? 'health-badge' : 'health-badge err';
  const key: I18nKey =
    state === 'ok' ? 'healthOk' :
    state === 'error' ? 'healthError' :
    state === 'offline' ? 'healthOffline' :
    'healthChecking';
  healthBadge.textContent = t(uiLanguage, key);
}

function setAutoButtonState(active: boolean): void {
  autoBtn.classList.toggle('active', active);
  autoBtn.textContent = t(uiLanguage, active ? 'btnAutoOn' : 'btnAuto');
}

function initTabs(): void {
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = document.getElementById(`tab-${btn.dataset.tab}`);
      pane?.classList.add('active');
      await autoSave();
    });
  });
}

function initSliders(): void {
  tempSlider.addEventListener('input', () => { tempVal.textContent = Number(tempSlider.value).toFixed(2); });
  topPSlider.addEventListener('input', () => { topPVal.textContent = Number(topPSlider.value).toFixed(2); });
  topKSlider.addEventListener('input', () => { topKVal.textContent = topKSlider.value; });
}

async function init(): Promise<void> {
  initTabs();
  initSliders();
  window.addEventListener('blur', () => { void autoSave(); });
  window.addEventListener('beforeunload', () => { void autoSave(); });
  await loadAndBind();
}

async function loadAndBind(): Promise<void> {
  settings = await getSettings();
  uiLanguage = settings.uiLanguage;

  populateUiLanguageSelect(settings.uiLanguage);
  applyI18n();

  backendInput.value = settings.backendUrl;
  urlDisplay.textContent = settings.backendUrl.replace(/^https?:\/\//, '');
  renderLanguageSelects();
  outsideTextToggle.checked = settings.config.outsideTextEnabled ?? false;

  llmProviderSelect.value = settings.config.provider;
  baseUrlInput.value = settings.config.baseUrl ?? '';
  llmApiKeyInput.value = settings.config.apiKey ?? '';
  modelInput.value = settings.config.modelName ?? '';
  tempSlider.value = String(settings.config.temperature);
  topPSlider.value = String(settings.config.topP);
  topKSlider.value = String(settings.config.topK);
  tempVal.textContent = Number(settings.config.temperature).toFixed(2);
  topPVal.textContent = Number(settings.config.topP).toFixed(2);
  topKVal.textContent = String(settings.config.topK);
  contextToggle.checked = settings.config.sendFullPageContext;
  instructionsInput.value = settings.config.specialInstructions ?? '';

  bind();
  await checkHealth(settings.backendUrl);
}

function bind(): void {
  if (isBound) return;
  isBound = true;

  saveBtn.addEventListener('click', async () => { await saveAndReport('statusSettingsSaved'); });
  saveConfigBtn.addEventListener('click', async () => { await saveAndReport('statusSettingsSaved'); });
  saveLlmBtn.addEventListener('click', async () => { await saveAndReport('statusLlmSettingsSaved'); });

  for (const el of [backendInput, sourceSelect, targetSelect, outsideTextToggle]) {
    el.addEventListener('change', () => { void autoSave(); });
  }

  uiLanguageSelect.addEventListener('change', () => {
    uiLanguage = normalizeUiLanguage(uiLanguageSelect.value);
    settings = collectAllSettings();
    applyI18n();
    renderLanguageSelects();
    void autoSave();
  });

  fetchModelsBtn.addEventListener('click', async () => {
    const baseUrl = baseUrlInput.value.trim();
    if (!baseUrl) {
      showModelError(t(uiLanguage, 'errorEnterBaseUrl'));
      return;
    }
    await fetchAndShowModels(baseUrl, llmApiKeyInput.value.trim());
  });

  llmProviderSelect.addEventListener('change', () => { void autoSave(); });
  for (const el of [baseUrlInput, modelInput, llmApiKeyInput, instructionsInput]) {
    el.addEventListener('change', () => { void autoSave(); });
  }
  for (const el of [tempSlider, topPSlider, topKSlider, contextToggle]) {
    el.addEventListener('change', () => { void autoSave(); });
  }

  scanBtn.addEventListener('click', async () => {
    scanBtn.disabled = true;
    setStatus(t(uiLanguage, 'statusOpeningScanner'), '');
    try {
      await autoSave();
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error(t(uiLanguage, 'errorNoActiveTab'));
      const injected = await ensureContentScript(tab.id);
      if (!injected) throw new Error(t(uiLanguage, 'errorInjectContent'));
      const opened = await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_SCANNER' });
      if (!opened?.ok) throw new Error(opened?.error ?? t(uiLanguage, 'errorScannerFailed'));
      setStatus(t(uiLanguage, 'statusScannerOpened'), 'ok');
      window.close();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err), 'err');
      scanBtn.disabled = false;
    }
  });

  autoBtn.addEventListener('click', async () => {
    autoBtn.disabled = true;
    try {
      await autoSave();
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error(t(uiLanguage, 'errorNoActiveTab'));
      const injected = await ensureContentScript(tab.id);
      if (!injected) throw new Error(t(uiLanguage, 'errorInjectContent'));
      if (autoBtn.classList.contains('active')) {
        setStatus(t(uiLanguage, 'statusStoppingAuto'), '');
        await chrome.tabs.sendMessage(tab.id, { type: 'STOP_AUTO_TRANSLATE' });
        setStatus(t(uiLanguage, 'statusAutoStopped'), 'ok');
        setAutoButtonState(false);
      } else {
        setStatus(t(uiLanguage, 'statusStartingAuto'), '');
        await chrome.tabs.sendMessage(tab.id, { type: 'START_AUTO_TRANSLATE' });
        setStatus(t(uiLanguage, 'statusAutoActive'), 'ok');
        setAutoButtonState(true);
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err), 'err');
    } finally {
      autoBtn.disabled = false;
    }
  });

  clearCacheBtn.addEventListener('click', async () => {
    clearCacheBtn.disabled = true;
    setStatus(t(uiLanguage, 'statusClearingCache'), '');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await ensureContentScript(tab.id);
        await chrome.tabs.sendMessage(tab.id, { type: 'CLEAR_CACHE' } as never);
      }
      setStatus(t(uiLanguage, 'statusCacheCleared'), 'ok');
      setTimeout(() => { clearCacheBtn.disabled = false; }, 2000);
    } catch {
      setStatus(t(uiLanguage, 'statusCacheCleared'), 'ok');
      clearCacheBtn.disabled = false;
    }
  });

  void refreshAutoTranslateStatus();
}

async function saveAndReport(successKey: I18nKey): Promise<void> {
  setStatus(t(uiLanguage, 'statusSaving'), '');
  const saved = await autoSave();
  if (saved) {
    urlDisplay.textContent = settings.backendUrl.replace(/^https?:\/\//, '');
    setStatus(t(uiLanguage, successKey), 'ok');
    await checkHealth(settings.backendUrl);
  } else {
    setStatus(t(uiLanguage, 'statusSaveFailed'), 'err');
  }
}

async function refreshAutoTranslateStatus(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await ensureContentScript(tab.id);
      const status = await chrome.tabs.sendMessage(tab.id, { type: 'GET_AUTO_TRANSLATE_STATUS' });
      if (status?.active) setAutoButtonState(true);
    }
  } catch {
    /* ignore */
  }
}

async function fetchAndShowModels(baseUrl: string, apiKey: string): Promise<void> {
  hideModelFeedback();
  modelLoading.style.display = 'flex';
  fetchModelsBtn.disabled = true;

  try {
    const models = await listModels(baseUrl, apiKey);
    if (!models || models.length === 0) {
      showModelHint(t(uiLanguage, 'modelNoModels'));
      return;
    }
    switchToModelSelect(models);
  } catch (err) {
    showModelError(err instanceof Error ? err.message : String(err));
  } finally {
    modelLoading.style.display = 'none';
    fetchModelsBtn.disabled = false;
  }
}

function switchToModelSelect(models: string[]): void {
  const currentModel = modelInput.value.trim();
  const select = document.createElement('select');
  select.id = 'f-model-select';
  select.className = 'model-select';
  select.replaceChildren();
  for (const model of models) {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    select.appendChild(option);
  }
  if (currentModel && models.includes(currentModel)) {
    select.value = currentModel;
  } else if (models.length > 0) {
    select.value = models[0] ?? '';
  }

  modelPickerWrap.querySelector('#f-model-select')?.remove();
  modelPickerWrap.appendChild(select);

  select.addEventListener('change', () => {
    modelInput.value = select.value;
    void autoSave();
  });

  if (!currentModel) {
    modelInput.value = select.value;
    void autoSave();
  }
  hideModelFeedback();
  showModelHint(t(uiLanguage, 'modelFound', { count: models.length }));
}

function showModelError(msg: string): void {
  modelError.textContent = msg;
  modelError.style.display = 'block';
  modelHint.style.display = 'none';
}

function showModelHint(msg: string): void {
  modelHint.textContent = msg;
  modelHint.style.display = 'block';
  modelError.style.display = 'none';
}

function hideModelFeedback(): void {
  modelError.style.display = 'none';
  modelHint.style.display = 'none';
}

async function listModels(baseUrl: string, apiKey: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const tid = setTimeout(() => reject(new Error(t(uiLanguage, 'listModelsTimeout'))), 30000);
    chrome.runtime.sendMessage(
      { type: 'LIST_MODELS', baseUrl, apiKey },
      (resp: unknown) => {
        clearTimeout(tid);
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          reject(new Error(`extension: ${lastError.message}`));
          return;
        }
        const r = resp as { models?: string[]; error?: string };
        if (r.error) reject(new Error(r.error));
        else resolve(r.models ?? []);
      },
    );
  });
}

async function autoSave(): Promise<boolean> {
  const next = collectAllSettings();
  const saved = await saveSettings(next);
  if (saved) settings = next;
  return saved;
}

function collectAllSettings(): AppSettings {
  const model = modelInput.value.trim();
  return {
    ...settings,
    backendUrl: backendInput.value.trim() || DEFAULT_SETTINGS.backendUrl,
    uiLanguage: normalizeUiLanguage(uiLanguageSelect.value),
    config: {
      ...settings.config,
      inputLanguage: sourceSelect.value,
      outputLanguage: targetSelect.value,
      provider: llmProviderSelect.value,
      baseUrl: baseUrlInput.value.trim() || undefined,
      modelName: model || undefined,
      apiKey: llmApiKeyInput.value.trim() || undefined,
      temperature: parseFloat(tempSlider.value),
      topP: parseFloat(topPSlider.value),
      topK: parseInt(topKSlider.value, 10),
      sendFullPageContext: contextToggle.checked,
      outsideTextEnabled: outsideTextToggle.checked,
      specialInstructions: instructionsInput.value.trim() || undefined,
    },
  };
}

async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return normalizeSettings(result[STORAGE_KEY] as StoredSettings | undefined);
}

async function saveSettings(nextSettings: AppSettings): Promise<boolean> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: nextSettings });
    return true;
  } catch {
    return false;
  }
}

async function checkHealth(backendUrl: string): Promise<void> {
  setHealthState('checking');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${backendUrl.replace(/\/$/, '')}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    setHealthState(response.ok ? 'ok' : 'error');
  } catch {
    setHealthState('offline');
  }
}

async function ensureContentScript(tabId: number): Promise<boolean> {
  try {
    const ping = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    if (ping?.ok) return true;
  } catch {
    /* inject below */
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-script/index.js'],
    });
    return true;
  } catch {
    return false;
  }
}

function setStatus(message: string, type: '' | 'ok' | 'err'): void {
  statusEl.textContent = message;
  statusEl.className = type;
}

void init();
