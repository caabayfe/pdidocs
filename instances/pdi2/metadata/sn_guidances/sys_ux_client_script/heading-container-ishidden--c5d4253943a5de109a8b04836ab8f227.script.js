/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const heading = api.state.heading.label;
    if ((heading && heading.length === 0) || !heading || heading === 'null' || heading === 'undefined') {
        return true;
    }
    return false;
}
