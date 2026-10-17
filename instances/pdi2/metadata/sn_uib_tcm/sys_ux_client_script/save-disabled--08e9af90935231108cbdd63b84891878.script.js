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
    const existingRecipients = api.state.existingRecipients;
    if (!Array.isArray(allSelectedRecipients) || !Array.isArray(existingRecipients) || allSelectedRecipients.length === 0) return true;

    var disableSave = (
        allSelectedRecipients.length === existingRecipients.length &&
        allSelectedRecipients.every((selectedRecipient) =>
            existingRecipients.some(
                (existingRecipient) => (
                    (selectedRecipient.id === existingRecipient.id) &&
                    (!selectedRecipient.role ? !existingRecipient.role : existingRecipient.role &&
                        selectedRecipient.role.id === existingRecipient.role.id)
                )
            )
        )
    );
    return disableSave;
}
