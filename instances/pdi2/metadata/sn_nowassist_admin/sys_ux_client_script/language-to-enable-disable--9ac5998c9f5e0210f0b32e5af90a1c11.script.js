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
    const payload = event.payload;
    let dtEnabled = payload.checked;
    let languageId = payload.itemId;

    let languages = api.state.languages;
    languages.forEach(item => {
        if (item.language.value === languageId) {
            item.dt_enabled.value = dtEnabled;
            item.dt_enabled.displayValue = dtEnabled.toString();
        }
    });
    api.setState('languages', languages);

    let selectedLanguagesCount = api.state.selectedLanguagesCount;
    selectedLanguagesCount += dtEnabled ? 1 : -1;
    api.setState('selectedLanguagesCount', selectedLanguagesCount);

    let updatedLanguages = api.state.updatedLanguages;
    const updatedLanguage = {
        dt_enabled: dtEnabled,
        language_id: languageId
    };
    updatedLanguages.push(updatedLanguage);
    api.setState('updatedLanguages', updatedLanguages);

}
