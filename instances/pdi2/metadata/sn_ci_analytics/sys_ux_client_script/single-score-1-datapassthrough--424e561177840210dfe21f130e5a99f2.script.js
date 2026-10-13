/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var payload = {};
    var output = api.data.fetch_deflection_metrics_count.output;
    if (output)
        payload = output.parPayload;
    return payload;
}
