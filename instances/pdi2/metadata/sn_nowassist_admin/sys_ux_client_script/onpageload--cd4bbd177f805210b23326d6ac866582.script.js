/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function evaluateEvent({
    api,
    event
}) {
    api.setState('filterId', api.context.props.payload.blockcontext.filterId);
    return {
        propName: "pageParams",
        value: api.context.props
    };
}
