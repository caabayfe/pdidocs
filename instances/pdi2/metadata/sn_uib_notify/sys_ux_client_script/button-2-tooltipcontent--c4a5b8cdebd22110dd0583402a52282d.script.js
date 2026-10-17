/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.type == "sendSms")
        return helpers.translateSync("Send SMS");
    else if (api.context.props.type == "addParticipants")
        return helpers.translateSync("Add Participants");
    else
        return helpers.translateSync("Start Conference");
}
