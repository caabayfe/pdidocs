/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	let toolTip = api.state.relatedRecordsViewConfig.toggleTooltipText;
  return helpers.translateSync(toolTip);
}
