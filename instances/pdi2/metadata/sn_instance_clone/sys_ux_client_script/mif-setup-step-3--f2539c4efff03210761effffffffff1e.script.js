/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    const homePageUtil = imports["sn_instance_clone.AdminCloneHomePageUiUtil"](api, helpers);

    // Transform the array
    const transformedInstances = api.state.multiInstanceView.trustorInstances.map(instance => ({
        instance_sys_id: instance.label,
        operation_type: instance.checked ? "add" : "delete"
    }));

    // Now pass the transformed array into the util API
    homePageUtil.callUtilAPI({
        operation: "SETUP_MIF_INSTANCES",
        trustorInstances: transformedInstances
    }, true);
}
