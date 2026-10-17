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
        repeatType
    } = api.state;
    return repeatType === 'specific' || repeatType === '';
}
