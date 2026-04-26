// src/utils/safeLegacy.js

/**
 * Wraps an async API call with legacy data safety:
 * - Catches all errors (network, parsing, unexpected shapes)
 * - Returns { data, error, isLegacyFallback }
 * - Logs warnings for unexpected structures without crashing the UI
 */
export async function safeFetch(apiFn, normalizer, label = 'API') {
  try {
    const raw = await apiFn();
    const normalized = normalizer(raw);

    // Detect if we had to fall back to defaults
    const isLegacyFallback = normalized?._meta !== undefined &&
      Object.keys(normalized._meta || {}).length > 5;

    if (isLegacyFallback) {
      console.warn(
        `[${label}] Legacy data detected — ${Object.keys(normalized._meta).length} unknown fields:`,
        Object.keys(normalized._meta)
      );
    }

    return { data: normalized, error: null, isLegacyFallback };
  } catch (error) {
    console.error(`[${label}] Fetch failed:`, error);
    return { data: null, error: error.message, isLegacyFallback: false };
  }
}
