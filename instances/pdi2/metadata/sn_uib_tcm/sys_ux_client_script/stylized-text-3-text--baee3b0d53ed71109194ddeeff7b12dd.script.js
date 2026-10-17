/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const allSelectedRecipients = api.state.allSelectedRecipients;
    const allSelectedRecipientsCount = Array.isArray(allSelectedRecipients) ? allSelectedRecipients.length : 0;
    return helpers.translateSync("{0} recipients", allSelectedRecipientsCount);
}
