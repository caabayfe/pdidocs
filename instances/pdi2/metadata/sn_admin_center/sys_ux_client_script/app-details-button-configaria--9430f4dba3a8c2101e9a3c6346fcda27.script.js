/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var ariaLabel = helpers.translateSync("See Details of "+api.context.props.applicationName);
	return {"button":{"aria-label":ariaLabel,"role":"link"}};
}
