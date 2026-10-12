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
        projectData,
        isPlaybookSourceTypeProject
    } = api.state;
    const currentEntity = api.item.value;

    if (isPlaybookSourceTypeProject && currentEntity.parentId) {
        return true;
    }
    return projectData.readonly;
}
