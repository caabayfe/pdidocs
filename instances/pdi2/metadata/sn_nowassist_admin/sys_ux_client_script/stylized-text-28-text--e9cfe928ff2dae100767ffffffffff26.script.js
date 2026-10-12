/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.errorFetchingSkills ? helpers.translateSync('Something went wrong! Please try again later') : helpers.translateSync('No skills found');
}
