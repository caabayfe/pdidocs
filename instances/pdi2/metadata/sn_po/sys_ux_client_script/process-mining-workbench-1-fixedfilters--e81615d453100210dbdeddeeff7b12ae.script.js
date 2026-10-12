/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const findingId = api.context.props.findingId;
    return findingId ? {
        finding: findingId
    } : {};
}
