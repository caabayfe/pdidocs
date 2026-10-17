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
    if (isPlaybookSourceTypeProject) {
        // hide child entity filters for play book projects
        if (selectedEntity.parent_entity?.value) {
            return true;
        }
        return false;
    }
    // don't show this section for non playbook projects
    return true;
}
