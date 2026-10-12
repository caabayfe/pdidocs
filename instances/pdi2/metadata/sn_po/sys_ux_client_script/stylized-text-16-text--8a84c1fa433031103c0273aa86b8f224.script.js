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
        processConditionType
    } = api.state;
    return processConditionType === 'START' ?
        helpers.translateSync('Select process start condition') :
        helpers.translateSync('Select process end condition');
}
