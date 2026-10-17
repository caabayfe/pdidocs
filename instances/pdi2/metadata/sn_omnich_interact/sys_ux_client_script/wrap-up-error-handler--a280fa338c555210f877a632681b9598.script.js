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
    var contentMsg;
    if (event.elementId === 'getsegmentbyagentandinteraction_1') {
        contentMsg = await helpers.translate("API Failure - Cannot get segment and configuration details which are needed for wrap up. Please contact your support team  or system admin");
    } else if (event.elementId === 'updatewrapupsegment') {
        contentMsg = await helpers.translate("API Failure - Could not update segment with wrap up details. Please contact your support team  or system admin.");
    }
    if (event.payload.errors.length) {
        api.emit("WRAP_UP#ADD_NOTIFICATION", {
            message: contentMsg,
        });
    }
}
