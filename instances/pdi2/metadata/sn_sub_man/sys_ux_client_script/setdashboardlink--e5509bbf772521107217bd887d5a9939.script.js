/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data.fetch_dashboard_link.results == null || api.data.fetch_dashboard_link.results.length == 0) return;
    const dashboard_link = api.data.fetch_dashboard_link.results[0].dashboard_link.value;
    api.setState('dashboardLink', dashboard_link);
}
