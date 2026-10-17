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
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);

    api.setState("showEstimatedDurationSummaryInfo", false);
    api.setState("showPreflightErrorMessage", false);
    api.setState("disableSubmitButton", false);
    api.setState("showPreflightWarningMessage", false);
    eventHandler.runPreflightChecks();
}
