/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let query = JSON.parse(JSON.stringify(api.state.query)); 
    query.query_json.excluded_discovery_source = String(event.payload.value);
    query.query_json.results_filter.values = [];
    api.setState('query', query);
    api.setState('selectedGapBaseSource', null);
    api.setState('isDirty',true);
}
