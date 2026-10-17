/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var progressState = event.payload.data.progressState.result.progressState;
    api.setState("progressState", progressState);
    if (progressState == "complete") {
        // its done - just need clear page state, then refresh
        // the count to set proper state
        console.log("progressState", progressState);
        helpers.modal.close("[component-id='install_list_modal']");
        helpers.modal.close("[component-id='insufficient_privileges_modal']");
        api.setState("hideLoader", true);
        api.setState("largestInstalledGroupLabel", null);
        api.setState("noInstalledGroups", true);
        api.setState("hasInstalledGroups", true);
        api.setState("hideModifyListLoader", true);
        api.data.password_group_counts.refresh();
        event.payload.data.progressState.result.progressState = "idle";
        api.setState("progressState", "idle");
        return;
    }

    // console.log("progressState ... ", progressState);
    var workerId = api.state.workerId;
    helpers.timing.setTimeout(api.data.progress_worker_state.execute, 5000, { "workerId": workerId });
}
