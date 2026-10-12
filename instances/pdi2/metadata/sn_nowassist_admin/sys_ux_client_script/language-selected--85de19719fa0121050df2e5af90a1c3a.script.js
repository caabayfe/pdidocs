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
    const payload = event.payload || {};
    let ntEnabled = payload.checked || false;
    let languageId = payload.itemId || "";

    let languages = api.state.languages || [];
    languages.forEach(language => {
        if (language.itemId === languageId) {
            language.checked = ntEnabled;
        }
    });
    api.setState('languages', languages);

    let selectedLanguagesCount = api.state.selectedLanguagesCount || 0;
    selectedLanguagesCount += ntEnabled ? 1 : -1;
    api.setState('selectedLanguagesCount', selectedLanguagesCount);

    const allowedLanguages = languages.filter(language => language.checked).map(language => language.itemId);
    api.setState('allowedLanguages', allowedLanguages);
}
