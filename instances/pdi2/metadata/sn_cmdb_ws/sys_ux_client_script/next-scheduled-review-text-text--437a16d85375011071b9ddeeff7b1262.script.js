/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync("Next Scheduled Review: {0}", api.context.props.taskSummaryObj.nextScheduledReview);
}
