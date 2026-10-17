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
        selectedEntity,
        isPlaybookSourceTypeProject
    } = api.state;

    // hide for child entities for play book projects
    if (selectedEntity.parent_entity?.value && isPlaybookSourceTypeProject) {
        return true;
    }
    return false;
}
