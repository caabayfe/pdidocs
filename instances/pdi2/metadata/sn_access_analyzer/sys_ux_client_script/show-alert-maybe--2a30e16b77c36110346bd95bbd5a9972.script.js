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

    const {getAlertObj} = imports["sn_access_analyzer.AccessanalyzerUIUtil"]();
    
    const eventName = "NOW_UXF_PAGE#ADD_NOTIFICATIONS";
    const alertItems = [];

    const isRecordNotAvailable = api.data.last_run_results.results.every(result => result.record_available.value === "no");
    if (isRecordNotAvailable) {
        const content = await helpers.translate("The record is not accessible to the user due to Query business rules or Domain separation security.");
        alertItems.push(getAlertObj("record_not_available_alert", content));
    }

    const isScriptExecutionPresent = api.data.last_run_results.results.some(result => result.script_execution.value !== null);
    if (isScriptExecutionPresent) {
        const content = await helpers.translate("One or more access controls with a script were found during analysis.");
        alertItems.push(getAlertObj("advanced_script_alert", content));
    }

    api.emit(eventName, {items: alertItems});

}
