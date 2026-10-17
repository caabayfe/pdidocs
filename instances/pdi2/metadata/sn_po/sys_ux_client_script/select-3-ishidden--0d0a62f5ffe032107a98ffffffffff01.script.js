/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // show only when the project is in edit mode.
    // and source type of playbook
    if (api.state.isEditing &&
        api.state.isPlaybookSourceTypeProject) {
        return false;
    }
    return true;
}
