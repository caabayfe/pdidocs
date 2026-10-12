const LEGAL = new Map([
    ['standby', new Set(['in_progress', 'in_review', 'cancelled'])],
    ['in_progress', new Set(['standby', 'in_review', 'cancelled'])],
    ['in_review', new Set(['standby', 'completed', 'cancelled'])],
    ['completed', new Set()],
    ['cancelled', new Set()]
]);
/** Is this exact plan move allowed? Anything not in the table is not. */
export function isLegal(from, to) {
    return LEGAL.get(from)?.has(to) ?? false;
}
