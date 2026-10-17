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
        width
    } = api.context.props.payload.props_details;

    return width ? width : '100%';
}
