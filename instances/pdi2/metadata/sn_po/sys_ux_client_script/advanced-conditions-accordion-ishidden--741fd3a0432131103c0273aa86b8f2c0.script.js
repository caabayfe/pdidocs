/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const selectedEntity = { ...api.state.selectedEntity };
    if (api.state.isPlaybookSourceTypeProject) {
        return true;
    }
    if (
        (Object.keys(selectedEntity).length === 0) ||
        (selectedEntity && selectedEntity.parent_entity && selectedEntity.parent_entity.value) || 
        (selectedEntity?.source_type?.value === api.state.SOURCE_TYPES.AGENTIC_AI_DATA)
    ) {
        return true;
    }
    return false;
}
