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
    const languages = api?.data?.nowllm_supported_languages?.output?.filter(i=> i.provider == api.context?.props?.provider)[0].supportedLanguages || [];
    var allowedLanguages = api?.data?.languages_enabled_for_native_translation?.output || {};
    allowedLanguages = allowedLanguages[api.context?.props?.provider]?.languages;
    const allowedLanguageIds = allowedLanguages?.id || [];

    const transformedLanguages = languages.map((language, index) => ({
        "checked": allowedLanguageIds.includes(language.id),
        "order": index,
        "itemId": language.id,
        "label": language.label
    }));

    const selectedLanguagesCount = transformedLanguages.filter(language => language.checked);

    api.setState('languages', transformedLanguages)
    api.setState('allowedLanguages', allowedLanguageIds)
    api.setState('selectedLanguagesCount', selectedLanguagesCount.length)

}
