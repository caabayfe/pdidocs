/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let nonReportingDiscoverySources = JSON.parse(JSON.stringify(api.state.nonReportingDiscoverySources));
    var query = JSON.parse(JSON.stringify(api.state.query));
    nonReportingDiscoverySources.splice(event.context.item.index,1);
    query.query_json.excluded_discovery_source = nonReportingDiscoverySources.join(',');
    api.setState('query', query);
    api.setState('nonReportingDiscoverySources', nonReportingDiscoverySources);
    api.setState('isDirty', true);
    api.emit('CHECK_FORM_STATUS');
}
