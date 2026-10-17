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
    const languages = api?.data?.languages_enabled_for_native_translation?.output || {};
    const languageLabel = languages.label.split(', ');
    const transformedLanguages = languageLabel.map((label) => ({
        "pillText": label,
    }));

    api.setState('nativeTranslationLanguages', transformedLanguages);
}
