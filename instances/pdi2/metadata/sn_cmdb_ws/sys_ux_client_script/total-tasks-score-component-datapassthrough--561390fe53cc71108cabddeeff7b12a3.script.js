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
        "data": [{
            "value": api.item.value.template_matching_tasks_count,
            "change": "0",
            "changePercent": "0"
        }],
        "metadata": {
            "dataSourceLabel": helpers.translateSync("Matching tasks"),
            "format": {
                "abbreviationEnabled": true,
                "customFormat": true,
                "precision": 0,
                "numberInTooltipsEnabled": true,
                "rounding": "UP",
                "thousandSeparatorEnabled": true
            }
        }
    }];
}
