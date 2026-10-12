// src/server/shared/queryParams.ts
// Pure parsing/validation for list-endpoint query params (limit, offset,
// sortOrder). Leaf module — no GlideRecord, no platform import — so the
// adapter layer can use it directly and any entity's own domain module can
// share its types without either side depending on the record seam.
//
// Extracted from DEF0897158's GET /plans work (adapters/rest/plans.ts /
// domain/plan.ts) once a second call site made the logic worth sharing
// rather than copy-pasting: domain/listQuery.ts is the GlideRecord-applying
// half of the same pattern; this file is the raw-string-parsing half.
// Coerce a raw limit/offset query-param string to a non-negative integer, or
// undefined on anything absent/malformed (blank, non-numeric, negative) —
// silent fallback, never a 400, matching this repo's live limit/offset
// precedent (routes-script/messages/getConversations.js's
// parseIntegerQueryParam). `max` clamps rather than rejects an over-large
// value.
export function parseNonNegativeInt(raw, max) {
    if (raw === '')
        return undefined;
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed < 0)
        return undefined;
    return max !== undefined ? Math.min(parsed, max) : parsed;
}
// Validate a raw sortOrder query-param string against one endpoint's own
// allowed set, returning it typed if valid or undefined otherwise — same
// silent-fallback contract as parseNonNegativeInt: an unrecognized value is
// treated as absent, not rejected.
export function parseSortOrder(raw, allowed) {
    return allowed.has(raw) ? raw : undefined;
}
