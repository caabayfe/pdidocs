/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var route = "hardening_settings_record";
    var table = "sn_vsc_instane_hardeninsn_vsc_instance_hardening_settingsg_settings";
    var sysId = api?.data?.get_the_largest_impact_score_non_compliant_setting?.output?.hardening_setting?.sysId;
    var params = {
        pageName: api.state.previousPage
    };
    var fields = {
        table: "sn_vsc_instance_hardening_settings",
        sysId: api?.data?.get_the_largest_impact_score_non_compliant_setting?.output?.hardening_setting?.sysId,
    };
    helpers.navigate.to(route, fields, params, null, null, null, null);
}
