/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let discoveryData = JSON.parse(JSON.stringify(api.state.discoveryData));
    discoveryData.all = api.data.get_all_ms_data_sources_composite__rest_2.dataSourcesWithSublabel.map((x) => x);
    if (discoveryData.all && discoveryData.all[0] && discoveryData.all[0].id === "")
        discoveryData.all.splice(0,1);
    discoveryData.all.sort((a, b) => (a.label > b.label) ? 1 : -1)
    api.setState('discoveryData',discoveryData);
}
