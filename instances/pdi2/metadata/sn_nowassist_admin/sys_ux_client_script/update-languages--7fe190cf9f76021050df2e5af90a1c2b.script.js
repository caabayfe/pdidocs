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
    const languages = api.data.languages.results || [];
    const selectedLanguagesCount = languages.reduce((count, language) => {
        if (language.dt_enabled.value) {
            return count + 1;
        }
        return count;
    }, 0);
    api.setState('selectedLanguagesCount', selectedLanguagesCount);
    api.setState('languages', languages);
}
