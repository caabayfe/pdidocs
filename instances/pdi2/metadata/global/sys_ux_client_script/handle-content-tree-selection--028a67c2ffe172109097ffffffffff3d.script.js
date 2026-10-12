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
    const {
        FormValidator
    } = imports["global.DMCFormValidator"]();

    const {
        isValid,
        formValidatorJson
    } = await FormValidator.validateState(api, helpers);
 
    if (!isValid) {
        return;
    }

    api.setState("selectedTabId", event.payload.item.id);
}
