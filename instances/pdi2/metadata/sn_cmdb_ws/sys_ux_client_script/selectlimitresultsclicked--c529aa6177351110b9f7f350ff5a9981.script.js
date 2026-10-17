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
    let query = JSON.parse(JSON.stringify(api.state.query));
    let selected_filter_type = event.payload.value;
    if (selected_filter_type == 'appl_service'){
            api.data.ms_get_application_services.refresh();
    } else if (selected_filter_type == 'tech_service'){
            api.data.ms_get_technical_services.refresh();
    } else if (selected_filter_type == 'cmdb_group'){
            api.data.ms_get_cmdb_groups.refresh();
    }
    query.query_json.results_filter.type = event.payload.value;
    query.query_json.results_filter.values = [];
    api.setState('query', query);
    api.setState('isDirty', true);

    api.emit('CHECK_FORM_STATUS');
}
