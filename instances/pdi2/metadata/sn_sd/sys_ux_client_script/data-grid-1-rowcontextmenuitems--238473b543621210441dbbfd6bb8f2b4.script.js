/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
            "actionName": "#ADD_CONTRIBUTING_INDICATOR",
            "criteria": "_metadata.indicatorLevel=constituent",
            "id": "add_contributing_indicator",
            "label": helpers.translateSync("Add contributing indicator"),
            "name": "add_contributing_indicator"
        },
        {
            "actionName": "#EDIT_INDICATOR_REGISTRY",
            "criteria": "_metadata.tableName=sn_sd_contributing_indicator_registry",
            "id": "edit_indicator_registry",
            "label": helpers.translateSync("Edit indicator registry"),
            "name": "edit_indicator_registry"
        },
        {
            "actionName": "#ADD_TIME_SAVINGS",
            "criteria": "_metadata.tableName=sn_sd_contributing_indicator_registry^_metadata.isTimeSaving=true",
            "id": "add_time_savings",
            "label": helpers.translateSync("Add time savings"),
            "name": "add_time_savings"
        },
        {
            "actionName": "#EDIT_TIME_SAVINGS",
            "criteria": "_metadata.tableName=sn_sd_contributing_indicator_registry^_metadata.isTimeSaving=true^timeSaving.value!=-1",
            "id": "edit_time_savings",
            "label": helpers.translateSync("Edit time savings"),
            "name": "edit_time_savings"
        },
        {
            "actionName": "#ADD_MORE_INFORMATION",
            "criteria": "_metadata.tableName=sn_sd_contributing_indicator_registry",
            "id": "add_more_information",
            "label": helpers.translateSync("Add more information"),
            "name": "add_more_information"
        }
    ];
}
