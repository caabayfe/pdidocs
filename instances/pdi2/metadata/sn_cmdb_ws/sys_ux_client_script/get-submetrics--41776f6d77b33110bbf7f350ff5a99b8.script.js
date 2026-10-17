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
    let id = "";
    const selectedType = api.state.selectedType;
    switch (selectedType) {
        case "class":
            id = api.state.selectedID;
            break;
        case "group":
            id = api.state.selectedGroup;
            break;
        case "service":
            id = api.state.selectedService;
            break;
    }
    api.data.health_dashboard_get_sub_metrics.execute({
        "dataType": selectedType,
        "id": id,
        "metric": api.state.selectedMetric
    });

}
