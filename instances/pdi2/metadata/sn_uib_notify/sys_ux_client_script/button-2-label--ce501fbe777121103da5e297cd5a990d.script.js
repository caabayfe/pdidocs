/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let label = "";
    if (api.context.props.type == "startConference") {
        label = helpers.translateSync("Start");
    } else if (api.context.props.type == "sendSms") {
        label = helpers.translateSync("Send");
    } else if (api.context.props.type == "addParticipants") {
        label = helpers.translateSync("Add participants");
    }
    return label;
}
