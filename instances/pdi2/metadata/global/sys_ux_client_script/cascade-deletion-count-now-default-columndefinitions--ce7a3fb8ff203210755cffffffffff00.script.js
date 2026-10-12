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
        columns: [{
                key: "table",
                label: helpers.translateSync("Table"),
                type: "string"
            },
            {
                key: "preview_record_count",
                label: helpers.translateSync("Estimate Record Count"),
                type: "string"
            }
        ]
    };
}
