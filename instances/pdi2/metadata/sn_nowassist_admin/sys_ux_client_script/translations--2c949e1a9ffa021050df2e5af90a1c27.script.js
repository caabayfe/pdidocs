/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const changesSavedLabel = await helpers.translate("Changes saved");
    const translations = api.state.translations;
    translations["confirmationLabel"] = changesSavedLabel;
    api.setState("translations", translations);

}
