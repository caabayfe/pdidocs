/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return helpers.translateSync("Review the list of KPIs available for benchmarking with {0}. Benchmarking KPI available for {1}.", api.item.value.name, api.item.value.groups);
}
