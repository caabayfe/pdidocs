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
    const type = api.context.props.type;
    let recipientCountText = "";
    if (type === "communicationTask") {
        recipientCountText = helpers.translateSync("{0} recipients", allSelectedRecipientsCount);
    } else if (type === "collaborationTask") {
        recipientCountText = helpers.translateSync("{0} participants", allSelectedRecipientsCount);
    }
    return recipientCountText;
}
