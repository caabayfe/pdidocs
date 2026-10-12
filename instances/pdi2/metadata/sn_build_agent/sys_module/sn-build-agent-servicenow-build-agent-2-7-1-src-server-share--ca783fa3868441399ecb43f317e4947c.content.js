export const STATE = {
    DRAFT: 1,
    WAITING: -5,
    READY: 10,
    IN_PROGRESS: 2,
    IN_REVIEW: 12,
    NEEDS_ATTENTION: 14,
    COMPLETED: 3,
    CANCELLED: 7
};
const BY_VALUE = new Map([
    [STATE.DRAFT, 'draft'],
    [STATE.WAITING, 'waiting'],
    [STATE.READY, 'ready'],
    [STATE.IN_PROGRESS, 'in_progress'],
    [STATE.IN_REVIEW, 'in_review'],
    [STATE.NEEDS_ATTENTION, 'needs_attention'],
    [STATE.COMPLETED, 'completed'],
    [STATE.CANCELLED, 'cancelled']
]);
const BY_NAME = new Map([...BY_VALUE].map(([v, n]) => [n, v]));
export function stateName(value) {
    const n = BY_VALUE.get(value);
    if (!n)
        throw new Error(`unknown state value: ${value}`);
    return n;
}
export function stateValue(name) {
    const v = BY_NAME.get(name);
    if (v === undefined)
        throw new Error(`unknown state name: ${name}`);
    return v;
}
// The ONE decoder for the persisted plan `state` column. Every row is stamped
// by Plan.create ('standby') and only Plan.transitionTo writes it after that,
// so an off-vocabulary or missing value is corrupt data — it THROWS, never
// coerces (prototype rule: no tolerance for malformed rows).
export function planStateOf(raw, context) {
    const v = String(raw ?? '');
    if (v === 'standby' || v === 'in_progress' || v === 'in_review' || v === 'completed' || v === 'cancelled')
        return v;
    throw new Error(`${context} has an invalid plan state: ${JSON.stringify(v)}`);
}
export function classifyState(state) {
    switch (state) {
        case 'in_review':
        case 'completed':
            return 'settled';
        case 'cancelled':
            return 'cancelled';
        case 'draft':
        case 'waiting':
        case 'ready':
        case 'in_progress':
        case 'needs_attention':
            return 'in_flux';
    }
}
