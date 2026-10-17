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
    let filterConfigurations = JSON.parse(api.context.props.payload.blockcontext?.currFilter?.filterConfigurations);
    api.setState('filterConfigurations',filterConfigurations?.assistant);
    return {
        propName: "pageParams",
        value: api.context.props
    };
}
