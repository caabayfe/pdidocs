import { gs } from '@servicenow/glide';
import { automaticRetryDepth } from '../glide/activity.ts';
const MAX_PRODUCT_RETRIES = 3;
const MAX_RETRIES_PROPERTY = 'sn_build_agent.implementation_job_monitor.max_retries';
export function configuredRetryCap() {
    const raw = gs.getProperty(MAX_RETRIES_PROPERTY, String(MAX_PRODUCT_RETRIES)).trim();
    if (!raw)
        return MAX_PRODUCT_RETRIES;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed))
        return MAX_PRODUCT_RETRIES;
    return Math.min(MAX_PRODUCT_RETRIES, Math.max(0, parsed));
}
export function triggerMatchesOutcome(trigger, outcome) {
    return trigger === 'agent_blocked' ? outcome === 'blocked' : outcome === 'interrupted';
}
export function retryMarkerForActivity(activity, trigger) {
    return retryMarkerForCount(automaticRetryDepth(activity), trigger);
}
export function retryMarkerForCount(count, trigger) {
    if (count === null || !Number.isInteger(count) || count < 0 || count > 3) {
        return { status: 'failed', trigger, count: null };
    }
    return { status: count >= configuredRetryCap() ? 'exhausted' : 'pending', trigger, count };
}
