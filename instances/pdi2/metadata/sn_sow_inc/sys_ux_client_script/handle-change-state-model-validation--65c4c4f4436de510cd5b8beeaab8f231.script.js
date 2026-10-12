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
    var fixedAlert = {};
    if (event.payload && event.payload.data && event.payload.data.output) {
        api.setState("isChangeModelValid", true);
        fixedAlert.type = "info";
        fixedAlert.message = await helpers.translate("A standard change request will be created. This change does not require CAB approval.");
    } else {
        api.setState("isChangeModelValid", false);
        fixedAlert.type = "critical";
        fixedAlert.message = await helpers.translate("Playbook is not compatible with the configured standard change model. Please contact your system administrator.");
    }
    api.setState("fixedAlert", fixedAlert);
}
