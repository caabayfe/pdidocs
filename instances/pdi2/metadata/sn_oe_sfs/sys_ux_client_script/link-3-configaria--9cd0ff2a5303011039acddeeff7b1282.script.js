/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api,
    helpers
}) {
    const linkLabel = api.state.currentScreenData.props_details.links[2].label;
    if (linkLabel) {
        return {
            "aria-label": linkLabel
        };
    }
    return '';
}
