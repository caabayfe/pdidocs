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
        isPlaybookSourceTypeProject,
        projectDetails,
        currentEntity
    } = api.state;
    return projectDetails.readonly ||
        (isPlaybookSourceTypeProject && Boolean(api.item.value.parentId));
}
