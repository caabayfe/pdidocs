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
    const nowAssistUtils = imports['sn_itsm_gen_ai.NowAssistForITSMClientUtils']();
    if (nowAssistUtils) {
        var interactionBanner = await nowAssistUtils.getInteractionBanner(helpers, event, api);
        if (interactionBanner && interactionBanner.message && interactionBanner.type) {
            api.data.record.addFormMessage(interactionBanner);
        }
    }
}
