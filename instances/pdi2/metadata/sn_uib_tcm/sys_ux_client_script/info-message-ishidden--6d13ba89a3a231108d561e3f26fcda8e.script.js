/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const collabTaskDetails = api.state.collabTaskDetails;
	return !(collabTaskDetails.channels && collabTaskDetails.channels.length > 0 && collabTaskDetails.channels[0].channelType && collabTaskDetails.channels[0].channelType.value === 'slack-channel-chat');
}
