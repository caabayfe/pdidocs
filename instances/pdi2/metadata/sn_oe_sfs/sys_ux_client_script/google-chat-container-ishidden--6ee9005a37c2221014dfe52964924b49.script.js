/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let hide_container = (api.context.props.channelType != 'google-chat');
	return hide_container;
}
