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
        return conferenceMessages['Select the conference bridge provider through which you want to send an SMS. Telephony providers if configured are displayed as numbers.'];
    else
        return conferenceMessages['Select the conference bridge provider through which you want to initiate the call. Telephony providers if configured are displayed as numbers.'];
}
