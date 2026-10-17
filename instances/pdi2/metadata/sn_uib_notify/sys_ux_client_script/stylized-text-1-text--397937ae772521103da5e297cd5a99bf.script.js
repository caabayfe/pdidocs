/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let title = "";
    if (api.context.props.modalTitle && api.context.props.modalTitle.length > 0) {
        return api.context.props.modalTitle;
    }
    if (api.context.props.type == "startConference") {
        title = helpers.translateSync("Start conference call");
    } else if (api.context.props.type == "sendSms") {
        title = helpers.translateSync("Send SMS");
    } else if (api.context.props.type == "addParticipants") {
        title = helpers.translateSync("Add participants");
    }
    return title;
}
