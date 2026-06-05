// Shared constants

export const DEFAULT_BACKEND_URL = 'http://localhost:7677';
export const API_TIMEOUT_MS = 120_000; // 2 minutes
export const MAX_BATCH_SIZE = 20;
export const MAX_IMAGE_DIMENSION = 8192;

// Storage keys
export const STORAGE_KEY_SETTINGS = 'manga_translator_settings';
export const STORAGE_KEY_STATUS = 'manga_translator_status';

// Message types for content <-> background communication
export const MSG_CHECK_HEALTH = 'MSG_CHECK_HEALTH';
export const MSG_HEALTH_RESULT = 'MSG_HEALTH_RESULT';
export const MSG_TRANSLATE = 'MSG_TRANSLATE';
export const MSG_TRANSLATE_RESULT = 'MSG_TRANSLATE_RESULT';
export const MSG_GET_SETTINGS = 'MSG_GET_SETTINGS';
export const MSG_SAVE_SETTINGS = 'MSG_SAVE_SETTINGS';
export const MSG_SETTINGS_RESULT = 'MSG_SETTINGS_RESULT';
export const MSG_SCAN_PAGE = 'SCAN_PAGE';
