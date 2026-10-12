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
    let route = "";
    let params = {};
    let table = event.payload.table;
    const sysId = event.payload.sys_id;
    const displayValue = event.payload.row.displayValue.value;

    // Switch on true to handle multiple conditions
    switch (true) {
        case displayValue.includes("User:"):
            table = "sys_user";
            break;
        case displayValue.includes("Table:"):
            table = "sys_db_object";
            break;
        case displayValue.includes("UI Page:"):
            table = "sys_ui_page";
            break;
        case displayValue.includes("Script Include:"):
            table = "sys_script_include";
            break;
        default:
            // keep table as-is
            break;
    }

    // Second switch for routing
    switch (table) {
        case "sn_access_analyzer_access_finding":
            route = "access_findings_details";
            break;
        default:
            route = "record";
            break;
    }

    const fields = { table, sysId };

    helpers.navigate.to(route, fields, params, null, null, null, null);
}
