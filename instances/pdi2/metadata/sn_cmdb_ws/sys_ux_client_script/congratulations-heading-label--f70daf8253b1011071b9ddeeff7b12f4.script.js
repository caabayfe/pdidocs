/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("Congratulations, {0}!", api.context.props.taskSummaryObj.assigneeName);
}
