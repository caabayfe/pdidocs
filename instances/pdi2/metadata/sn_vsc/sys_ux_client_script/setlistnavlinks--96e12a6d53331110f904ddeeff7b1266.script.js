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
    var route = "";
    var params = {};
    var table = event.payload.table;
    var isDocLink = false;
    if (event?.payload?.row?.displayValue?.value?.startsWith("Baseline v")) {
        isDocLink = true;
    } else if (table == "sn_vsc_instance_hardening_settings") {
        var ciSysId = event.payload.row.rowData.value.get("setting_set_setting").columnData.value;
    } else {
        var ciSysId = event.payload.row.rowData.value.get("setting_set_setting.security_check_category").columnData.value;
    }
    if (isDocLink) {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: '/api/now/v1/context_doc_url/sc-rid:baseline-hardening-settings'
            }
        });
    } else {
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
            sysId: ciSysId,
        };
        helpers.navigate.to(route, fields, params, null, null, null, null);
    }

}
