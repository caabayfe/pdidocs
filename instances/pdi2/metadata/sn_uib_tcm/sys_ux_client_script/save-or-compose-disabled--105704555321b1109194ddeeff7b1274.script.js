/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let {
        shortDescription
    } = api.state;
    if (typeof shortDescription !== "string") return;
    shortDescription = shortDescription.trim();
    const {
        selectedChannelsList,
        allSelectedRecipients,
        whenToSendCommunication,
        frequency,
        dueIn
    } = api.state;
    const isValidShortDescription = shortDescription && (shortDescription.length > 0);
    const isValidChannelList = selectedChannelsList && (selectedChannelsList.length > 0);
    const isValidRecipientList = allSelectedRecipients && (allSelectedRecipients.length > 0);
    const isValidDueIn = dueIn ? (Number(dueIn) > 0) : true;
    let enableSave = ((isValidShortDescription && isValidChannelList && isValidRecipientList && frequency && isValidDueIn));
    if (whenToSendCommunication === "later") {
        enableSave = (enableSave && dueIn && isValidDueIn);
    }
    return !enableSave;
}
