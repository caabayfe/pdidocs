/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var fetchedData = api.data.get_multisource_filtered_chart_data.output.result;
    if (fetchedData.number_of_discovery_sources != null) {
        api.setState('chartsData', fetchedData);
    }
}
