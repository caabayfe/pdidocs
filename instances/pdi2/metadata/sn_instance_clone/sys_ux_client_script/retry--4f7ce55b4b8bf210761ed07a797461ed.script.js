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
    var retryInstance = event.context.item.value;

    const trustorInstanceReqJson = [{
        instance_id: retryInstance.itemId,
        operation_type: "add",
        instance_name: retryInstance.instance_name || retryInstance.label || ''
    }];

    // Now pass the trustor instances array into the util API
    mifUtil.callUtilAPI({
        operation: "SETUP_MIF_INSTANCES",
        trustorInstances: trustorInstanceReqJson
    }, true);

    api.data.fetch_mif_record_1.refresh();



}
