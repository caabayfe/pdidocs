/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let languages = [];
    const dTLanguages = api.state.languages;
    dTLanguages.forEach((language, index) => {
        languages.push({
            "checked": language.dt_enabled.value,
            "order": index,
            "itemId": language.language.value,
            "label": language.language.displayValue
        });
    });
    return languages;

}
