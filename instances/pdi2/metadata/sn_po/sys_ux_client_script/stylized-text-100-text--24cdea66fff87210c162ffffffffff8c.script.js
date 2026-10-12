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
        playbookExecutionsCount
    } = api.state;
    return helpers.translateSync("Number of results matching criteria: {0}", playbookExecutionsCount);
}
