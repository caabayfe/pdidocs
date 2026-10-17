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
    if (event.context.item.value.invite) {
        helpers.writeText(event.context.item.value.invite);
        const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
        let message = await helpers.translate("Copy invite successful");
        notifyConfUtils.showAlert(api, message, "info");
    }
}
