/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    if (api.state.def_config_details.activity_context == "") {
        return api.data.get_activity_table.items[1].value;
    }
    return api.state.def_config_details.activity_context;
}
