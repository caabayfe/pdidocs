/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.context.props.type == "sendSms" && api.state.smsMaxLength)
  	return api.state.smsMaxLength;
  else
  	return '160';
}
