/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return !api.data.total_cis_with_single_source.output[api.state.selectedCIFilter] || parseInt(api.data.total_cis_with_single_source.output[api.state.selectedCIFilter]) < 1;
}
