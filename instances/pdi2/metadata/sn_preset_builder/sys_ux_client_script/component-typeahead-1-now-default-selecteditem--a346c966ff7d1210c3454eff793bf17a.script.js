/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // we only want to provide a selected item if a preselectedComponentMcpId 
    // is available and the field is "locked"
    if (
        !api.context.props.preselectedComponentMcpId ||
        !api.state.selectedComponent.label
    ) {
        return null;
    }

    return api.state.selectedComponent;
}
