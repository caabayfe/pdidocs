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
    const disable_dynamic_translation = api.data.lookup_dynamic_translation_property_value || {};
    const value = !(disable_dynamic_translation && disable_dynamic_translation.output.value);
    api.setState('DTValue', value);
    if (value === true) {
        api.setState('showDTOnAlert', true);
    }
}
