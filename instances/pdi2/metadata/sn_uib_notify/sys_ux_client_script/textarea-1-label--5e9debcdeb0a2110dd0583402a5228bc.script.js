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
        return helpers.translateSync('Message');
    else {
        const initialData = api.data.notify_conference_get_initial_data.output || {};
        const conferenceMessages = initialData.conferenceMessages || {};
        if (api.state.selectedProvider && api.state.selectedProvider.provider == "Telephony") {
            return conferenceMessages['Include a brief message for participants'] || "";
        } else {
            return conferenceMessages["Provide a brief description, this note will be stored in the conference record."] || "";
        }
    }
}
