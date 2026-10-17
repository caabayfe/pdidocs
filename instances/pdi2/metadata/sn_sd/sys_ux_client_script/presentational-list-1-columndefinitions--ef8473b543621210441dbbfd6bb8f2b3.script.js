/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        "columns": [{
                "key": "contributingIndicator",
                "label": helpers.translateSync("Contributing Indicator"),
                "type": "string"
            },
            {
                "key": "poProject",
                "label": helpers.translateSync("Mapped PM project name"),
                "type": "string"
            },
            {
                "key": "table",
                "label": helpers.translateSync("Table"),
                "type": "string"
            },
            {
                "key": "conditionApplied",
                "label": helpers.translateSync("Condition Applied"),
                "type": "string"
            },
            {
                "key": "status",
                "label": helpers.translateSync("Active"),
                "type": "string"
            }
        ]
    };
}
