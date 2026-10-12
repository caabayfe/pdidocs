/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return "Message timestamp (UTC) for " + api.state.hermesTopicName + ": ";
}
