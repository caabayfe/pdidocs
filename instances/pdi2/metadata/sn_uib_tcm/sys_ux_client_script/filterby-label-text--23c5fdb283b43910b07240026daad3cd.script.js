/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var tabType = api.context.props.tabType;
  if (tabType == "Communicate") return helpers.translateSync("Filter by communication plan");
  else if (tabType == "Collaborate") return helpers.translateSync("Filter by channel");
}
