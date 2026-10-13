/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const initialData = api.data.notify_conference_get_initial_data.output || {};
  const conferenceMessages = initialData.conferenceMessages || {};
	if (api.context.props.type == "sendSms")
		return conferenceMessages['Please enter a text message to be sent.'] || "";
	else
		return conferenceMessages['Message to be included for participants.'] || "";
}
