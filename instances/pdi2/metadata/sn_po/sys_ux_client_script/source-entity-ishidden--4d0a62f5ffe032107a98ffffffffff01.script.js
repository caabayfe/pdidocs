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
        isEditing,
        isPlaybookSourceTypeProject
    } = api.state;
    if (isEditing && isPlaybookSourceTypeProject) {
        return true;
    }
    return false;
}
