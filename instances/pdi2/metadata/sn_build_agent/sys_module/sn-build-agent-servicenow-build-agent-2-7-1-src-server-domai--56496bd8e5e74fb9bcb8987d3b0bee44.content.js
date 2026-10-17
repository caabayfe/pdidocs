// Regex-dispatches a 'field_asc'/'field_desc' sortOrder string to
// gr.orderBy/orderByDesc using the caller's own column map. Falls back to
// defaultField — never calls orderBy with an unrecognized value — whenever
// sortOrder is absent, malformed, or names a field that isn't a key in
// `columns`. Same "treat as absent" contract every caller's own query-param
// parsing (shared/queryParams.ts's parseSortOrder) already applies one layer
// up; this is the second, independent place that contract is honored, since
// a caller could in principle pass a sortOrder that didn't come through that
// parsing at all.
export function applySort(gr, sortOrder, columns, defaultField) {
    const match = sortOrder?.match(/^(.+)_(asc|desc)$/);
    const field = match?.[1];
    const direction = match?.[2];
    if (field !== undefined && Object.prototype.hasOwnProperty.call(columns, field)) {
        const column = columns[field];
        if (direction === 'desc')
            gr.orderByDesc(column);
        else
            gr.orderBy(column);
    }
    else {
        gr.orderBy(defaultField);
    }
    // Tiebreaker: sys_id is unique, so chaining it as a secondary sort key
    // guarantees a stable, deterministic order across pages even when the
    // primary column ties — a timestamp shared by two rows created/updated in
    // the same tick, or the default `order` field, which many root plans
    // share (commonly 0). Real GlideRecord chains successive orderBy/
    // orderByDesc calls as additional sort keys (already relied on in
    // production by glide/attachments.ts's own
    // `orderBy('sys_created_on'); orderBy('sys_id');` pair) — the jest fake
    // needed extending to model that; see glide/__mocks__/records.ts.
    gr.orderBy('sys_id');
}
// Windows the cursor when a limit is given; offset defaults to 0. Uses
// chooseWindow (not setLimit), which is what gives offset a skip — mirrors
// the live getConversations.js precedent (chooseWindow + setNoCount) rather
// than inventing a second pagination mechanism.
//
// `offset` without `limit` is a no-op, not a skip-with-no-cap: `if (!limit)
// return` exits before chooseWindow is ever called, so an offset given alone
// is silently ignored and the full, unpaginated result comes back — same
// `if (limit > 0)` gate getConversations.js uses. Not an oversight; callers
// (including a future WorkItem consumer) should treat `offset` as meaningful
// only when paired with `limit`.
export function applyWindow(gr, limit, offset) {
    if (!limit)
        return;
    const first = offset ?? 0;
    gr.chooseWindow(first, first + limit);
    gr.setNoCount();
}
