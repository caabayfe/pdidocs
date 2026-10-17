/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const totalRecordsLabel = helpers.translateSync('Total Records');
    return [{
        "label": totalRecordsLabel,
        "value": {
            "type": "string",
            "value": api.item.value.recordCountCount
        }
    }];
}
