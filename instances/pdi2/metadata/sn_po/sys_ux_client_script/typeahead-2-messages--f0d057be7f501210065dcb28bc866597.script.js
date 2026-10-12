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
        errorMessage
    } = api.state;
    const formattedErrorMessage = {
        status: 'critical',
        icon: 'triangle-exclamation-outline',
        content: errorMessage,
    };
    return errorMessage ? [formattedErrorMessage] : [];
}
