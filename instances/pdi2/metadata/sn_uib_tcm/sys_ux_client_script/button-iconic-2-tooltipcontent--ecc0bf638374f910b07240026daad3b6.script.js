/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.context.props.tabType == "Communicate") return helpers.translateSync("Filter to only see communications from certain communication plans");
  else if (api.context.props.tabType == "Collaborate") return helpers.translateSync("Filter to only see collaborations from chats or calls");
}
