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
   
    api.setState("currFilter", api.context.props.payload.blockcontext.currFilter);
    return {
        propName: "pageParams",
        value: api.context.props
    };
}
