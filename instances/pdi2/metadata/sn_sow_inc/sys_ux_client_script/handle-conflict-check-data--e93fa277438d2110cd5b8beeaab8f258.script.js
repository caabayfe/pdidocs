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
    var showConflictWarning = false;
    var showConflictFreeProposal = false;
    var output = api.data.change_management_conflict_1.output;
    var highlightedValueConfig = api.state.highlightedValueConfig;
    var fieldValueMap = api.state.fieldValueMap;
    var labelValueLoad = [];
    for (var field in fieldValueMap) {
        var item = {};
        if (fieldValueMap[field].visible) {
            item.label = fieldValueMap[field].label;
            item.value = {};
            item.value.type = "string";
            item.value.value = fieldValueMap[field].value;
            labelValueLoad.push(item);
        }
    }
    api.setState("labelValueLoad", labelValueLoad);
    if (api.state.showConflictCheckView) {
        api.setState("showConflictCheckView", false);
        api.setState("showCardView", true);
    }
    if (output.result && output.result.job_status && output.result.job_status == "2") {
        if (output.result && output.result.status && output.result.status == "Conflict") {
            api.setState("highlightedValue", highlightedValueConfig.hasConflict);
            api.data.change_next_conflict_free_window_1.execute({
                "sys_id": api.state.targetSysId
            });
            showConflictFreeProposal = true;
        } else if (output.result && output.result.status && output.result.status == "No Conflict") {
            api.setState("highlightedValue", highlightedValueConfig.noConflict);
        } else {
            showConflictWarning = true;
            api.setState("highlightedValue", {});

        }
    }
    api.setState("showConflictWarning", showConflictWarning);
    api.setState("showConflictFreeProposal", showConflictFreeProposal);
}
