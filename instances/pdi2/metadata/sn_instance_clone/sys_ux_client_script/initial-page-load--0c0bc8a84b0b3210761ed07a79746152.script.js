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
    var mifdata = api.data.fetch_mif_record_1.output;


    api.setState("isMifEnabled", mifdata.isMifEnabled);
    api.setState("trustorInstances", mifdata.trustorInstances);


    var mifinstances = api.data.fetch_mif_instances_1.output;
    api.setState('instances', mifinstances.records);
}
