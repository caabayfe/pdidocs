/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var filterQuery = api.state.dataEgressDateFilterConitions;
    if (event.payload.data.elements[0] === 'Export') {
        filterQuery = api.state.dataEgressExportFilterConditions;
    } else if (event.payload.data.elements[0] === 'API') {
        filterQuery = api.state.dataEgressApiFilterConditions;
    } 
    api.setState('overviewPieChartFilterCondition', filterQuery);
}
