/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var route = "";
    var table = event.payload.table;
    var sysId = event.payload.sys_id;
    var params = {};
    
    if (table == "sn_vsc_security_check_categories") {
        route = "record";
        params = {
            page: api.state.previousPageCategory
        };
    } else {
       route = "hardening_settings_record";
       params = {
           pageName: api.state.previousPage
        }; 
    }

    var fields = {
        table: table,
        sysId: sysId,
    };

    helpers.navigate.to(route, fields, params, null, null, null, null);
}
