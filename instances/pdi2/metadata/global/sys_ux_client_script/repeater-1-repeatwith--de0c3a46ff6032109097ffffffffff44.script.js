/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var messages = [];
  if(api.data.rule_management_dmc.messages) messages.push(...api.data.rule_management_dmc.messages);
  if(api.context.props.messagesFromParent) messages.push(...api.context.props.messagesFromParent);
	return messages;
}
