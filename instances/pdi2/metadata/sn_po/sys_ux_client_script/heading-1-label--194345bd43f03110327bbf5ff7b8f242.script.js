/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.projectDetails?.name) {
        return helpers.translateSync(`{0} - set objectives`, api.state.projectDetails.name);
    }

    return helpers.translateSync('Project Setup - set objectives');
}
