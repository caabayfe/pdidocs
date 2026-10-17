// Read-only bridge to the provider resolver shared by interactive and headless
// Build Agent turns. Provider selection, BYOK credentials, freemium behavior,
// model overrides, and connection attributes remain owned by the Script Include.
/// <reference path="./glideBridge.d.ts" />
import { gs } from '@servicenow/glide';
import { ProviderConfigResolver } from '@servicenow/glide/sn_build_agent';
function isResolved(result) {
    if (!result || typeof result !== 'object')
        return false;
    const value = result;
    return (value.success === true &&
        value.modelConfig &&
        typeof value.modelConfig.provider === 'string' &&
        value.modelConfig.largeConfig &&
        value.modelConfig.smallConfig &&
        value.attributes &&
        typeof value.attributes.baseUrl === 'string' &&
        value.attributes.baseUrl.length > 0 &&
        typeof value.attributes.capabilityId === 'string' &&
        value.attributes.capabilityId.length > 0);
}
// Fail closed. A missing or invalid provider must prevent enqueue rather than
// silently send a turn through a hard-coded endpoint or model.
export function resolveProviderConfig() {
    try {
        const result = new ProviderConfigResolver().resolve(null, false);
        if (!isResolved(result)) {
            const error = result && typeof result === 'object' && 'error' in result ? String(result.error ?? '') : '';
            gs.warn(`[foundry] provider configuration could not be resolved${error ? `: ${error}` : ''}`);
            return null;
        }
        return { modelConfig: result.modelConfig, attributes: result.attributes };
    }
    catch (error) {
        gs.warn(`[foundry] provider configuration resolver threw: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
