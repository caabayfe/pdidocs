/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let query = JSON.parse(JSON.stringify(api.state.query));
    query.query_json.results_filter.values = [];
    query.query_json.results_filter.values.push(event.payload.value);
    api.setState('query', query);
}
