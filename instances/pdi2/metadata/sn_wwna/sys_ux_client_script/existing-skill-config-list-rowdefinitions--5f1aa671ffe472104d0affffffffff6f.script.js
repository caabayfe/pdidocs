/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        rows: api.state.existingVarSetDetails?.[api.state.selectedButtonConfig?.props?.wwna_component_id] || []
    };
}
