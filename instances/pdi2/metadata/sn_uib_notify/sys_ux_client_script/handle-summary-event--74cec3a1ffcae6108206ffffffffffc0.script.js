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
    const elementId = event.elementId;
    var output = api.data[elementId].output;
    var message = "";
    var level = "critical";
    if (elementId === "get_conference_summary") {
        if (output && output.title) {
            var title = await helpers.translate("Title:");
            var overview = await helpers.translate("Overview:");
            var summaryFormat = `<div style='padding: 0 10px 16px; font-size: 1rem'><h4 style='margin-bottom: 0.5rem; font-size: 1rem'>${title}</h4><div>${output.title}</div><h4 style='margin-bottom: 0.5rem; font-size: 1rem'>${overview}</h4><div>${output.overview}</div></div>`;
            api.setState('summary', summaryFormat);
            return;
        } else message = output.message;
    } else if (elementId === "post_summary" && output.status) {
        message = output.message;
        level = "info"
    }
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    if (!message) return;
    let alerts = [];
    alerts.push({
        message,
        level
    });
    notifyConfUtils.showMultipleAlerts(api, alerts);
}
