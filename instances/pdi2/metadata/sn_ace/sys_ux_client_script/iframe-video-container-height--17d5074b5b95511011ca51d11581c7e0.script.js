/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        height
    } = api.context.props.payload.props_details;
    return height ? height : '13rem';
}
