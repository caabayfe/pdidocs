/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Set improvement opportunities should be hidden for playbook project
    if (api.state.isPlaybookSourceTypeProject) {
        return helpers.translateSync("Review and mine");
    }
    return helpers.translateSync("Set improvement opportunities");
}
