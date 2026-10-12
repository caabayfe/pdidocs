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

    let name = event.context.item.value.name;
    let id = event.context.item.value.class;
    const selectedType = api.state.selectedType;
    let groupOrServiceId = "";
    let pieChartQuery = "";
    switch (selectedType) {
        case "group":
            groupOrServiceId = api.state.selectedGroup;
            break;
        case "service":
            groupOrServiceId = api.state.selectedService;
            break;
    }
    const elementId = event.elementId;
    if(elementId == 'missing_by_source_chart' || elementId == 'missing_by_owner_chart'){
        pieChartQuery = event.payload.params.query;
    }
    helpers.navigate.to('health-dashboard-sub-metrics', {

    }, {
        cb: Date.now(), // cache busting
        'type': selectedType,
        'id': id,
        'groupOrServiceId': groupOrServiceId,
        'card': api.state.selectedHealthCard,
        'metric': api.state.selectedMetric,
        'name': name,
        'pieChartQuery': pieChartQuery
    });
}
