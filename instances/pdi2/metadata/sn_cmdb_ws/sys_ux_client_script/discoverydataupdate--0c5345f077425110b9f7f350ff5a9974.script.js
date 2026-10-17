/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    api.setState('discoveryData' , ({ currentValue, api }) => {
        let discoveryData = JSON.parse(JSON.stringify(currentValue));
        // availble = copy all and remove any that are selected
        discoveryData.available = currentValue.all.filter((o) => (!api.state.query.query_json.discovery_sources.find(item => (item === o.id))));

        // nonReporting
        discoveryData.nonReporting = currentValue.all.filter((o) => ((!api.state.nonReportingDiscoverySources.find(item => (item === o.id))) && (!api.state.query.query_json.discovery_sources.find(item => (item === o.id)))));

        // gapBase = copy all and remove any that are select and is selected as tracing source
        discoveryData.gapBase = currentValue.all.filter((o) => ((!api.state.nonReportingDiscoverySources.find(item => (item === o.id))) && (!api.state.query.query_json.discovery_sources.find(item => (item === o.id)))));
    
        return discoveryData;
    });
}
