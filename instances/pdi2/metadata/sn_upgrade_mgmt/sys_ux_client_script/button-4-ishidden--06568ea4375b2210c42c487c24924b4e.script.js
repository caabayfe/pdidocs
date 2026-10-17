/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	let activityState = api.context.props.activityState.value;

	return activityState !== "IN_PROGRESS";
}
