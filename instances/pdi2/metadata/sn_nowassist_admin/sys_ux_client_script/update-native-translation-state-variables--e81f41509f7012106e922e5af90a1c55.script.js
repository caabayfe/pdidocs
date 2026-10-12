/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    /**
     * @param {params} params
     * @param {api} params.api
     * @param {any} params.event
     */
    function evaluateEvent({
        api,
        event
    }) {
        const NATIVE_TRANSLATION_PROPERTY = "sn_generative_ai.enable_native_translation";
        const output = api?.data?.native_translation_value?.output || {};
        const value = output?.properties[NATIVE_TRANSLATION_PROPERTY];
        const nativeTranslationValue = value === 'true';

        api.setState('nativeTranslationValue', nativeTranslationValue);
        if (value === true) {
            api.setState('showNTOnAlert', true);
            api.setState('NTEnableSuccess', true);
        }
    }

}
