/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.payload.cctype && api.context.props.payload.ctype.props && api.context.props.payload.ctype.props.length > 0) {
        const {
            element
        } = api.context.props.payload.ctype.props[0];
        if(element && api.context.props.payload.props_details[element] && api.context.props.payload.props_details[element].length > 0) return 0;
    }
    return 1;
}
