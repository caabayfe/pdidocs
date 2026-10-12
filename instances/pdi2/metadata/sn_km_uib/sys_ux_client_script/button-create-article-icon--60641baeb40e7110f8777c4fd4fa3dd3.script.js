/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.useGenAI)
        return 'sn-sparkmoji-logo-outline';
    return '';
}
