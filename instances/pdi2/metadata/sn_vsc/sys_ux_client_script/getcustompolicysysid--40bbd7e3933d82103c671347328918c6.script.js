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
    api.setState("customPolicySysId", api.data.create_a_new_custom_policy.output);
    var route = "security_policy_details";
    var params = {
           selectedTabIndex: 1
    };
    var table = "sn_vsc_security_policy";
    var sysId = api.data.create_a_new_custom_policy.output;
    if (!table || !sysId) {
        console.error("Unexpected payload: table: " + table + ", sys_id: " + sysId);
        return;
    }
    
    var fields = {
        table: table,
        sysId: sysId,
    };

    helpers.navigate.to(route, fields, params, null, null, null, null);
}
