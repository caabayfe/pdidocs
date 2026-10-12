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
    const mifUtil = imports["sn_instance_clone.CloneMIFUtil"](api, helpers);

    const selectedInstances = api.state.selectedInstances || [];
    const existingTrustorInstances = api.state.trustorInstances || [];

    // Transform selected instances into trustor format
    const trustorInstanceReqJson = selectedInstances.map(instance => ({
        instance_id: instance.itemId,
        operation_type: "add",
        instance_name: instance.instance_name || instance.itemId
    }));
    
    // Move to next step
    api.setState('stepContainer', 2);

    // Now pass the trustor instances array into the util API
    mifUtil.callUtilAPI({
        operation: "SETUP_MIF_INSTANCES",
        trustorInstances: trustorInstanceReqJson
    }, true);

    // Add selected instances with status "requested", avoiding duplicates
    const existingIds = existingTrustorInstances.map(inst => inst.itemId);
    const newInstances = selectedInstances
        .filter(instance => !existingIds.includes(instance.itemId))
        .map(instance => ({
            itemId: instance.itemId,
            instance_name: instance.instance_name || instance.itemId,
            label: instance.label || instance.instance_name || instance.itemId,
            status: "requested"
        }));

    const updatedTrustorInstances = [...existingTrustorInstances, ...newInstances];
    api.setState('trustorInstances', updatedTrustorInstances);
}
