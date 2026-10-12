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
        projectIdleTimeEnabled,
        idleTimeConfiguration: {
            isIdleTimeConfigValid
        }
    } = api.state;
    return (!projectIdleTimeEnabled && !isIdleTimeConfigValid);
}
