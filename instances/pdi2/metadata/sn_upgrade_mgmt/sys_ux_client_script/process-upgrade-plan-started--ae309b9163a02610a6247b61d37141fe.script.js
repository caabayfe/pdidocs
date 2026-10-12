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
    if(api.data.start_processing_upgrade_plan_1.output && api.data.start_processing_upgrade_plan_1.output !== ""){
        api.setState("isProcessing", true);
        api.setState("isProcessingClicked", true);
        api.setState("columnData", api.state.disabledColumnData);
        api.data.look_up_exec_tracker_status.refresh();
    }else{
        api.setState("isProcessing", false);
    }
}
