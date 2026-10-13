/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const initialData = api.data.notify_conference_get_initial_data.output || {};
    const conferenceMessages = initialData.conferenceMessages || {};
    if (api.context.props.type == "sendSms")
        return conferenceMessages['Add the required members you want to send an SMS to. Recommendations could be used to quickly add participants.'] || "";
    else
        return conferenceMessages['Add the required members you want to connect with on call. Recommendations could be used to quickly add participants.'] || "";
}
