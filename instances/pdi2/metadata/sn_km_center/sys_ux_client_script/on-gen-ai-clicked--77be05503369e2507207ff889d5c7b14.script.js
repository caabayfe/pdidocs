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
    if (api.state.genAiSourceRecordId) {
        api.setState('isSearchLoading', true);
        api.setState('multitaskOKButtonLabel', await helpers.translate("Continue without more tasks"));
    } else {
        helpers.modal.close("modal_gen_ai");
        helpers.modal.open("modal_multitask_selector");
        api.setState('multitaskOKButtonLabel', await helpers.translate("Continue with selected tasks"));
        api.setState('multitaskOKButtonIsDisabled', true);
    }
}
