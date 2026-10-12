/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const results = api.data.fetch_error_source_application.results || [];
    const sysIds = results.map(item => item._row_data.uniqueValue);

    api.setState('source_application', sysIds.join(','));
}
