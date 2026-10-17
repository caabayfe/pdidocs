/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let label = "";
    switch (api.state.selectedType) {
        case 'group':
            label = helpers.translateSync("To see CMDB Group Dashboard you must create at least one CMDB group of type health");
            break;
        case 'service':
            label = helpers.translateSync("To see CMDB Service Dashboard the 'Event Management and Service Mapping Core' plugin is required");
            break;
    }
    return {
        "label": label,
        "level": 1
    };
}
