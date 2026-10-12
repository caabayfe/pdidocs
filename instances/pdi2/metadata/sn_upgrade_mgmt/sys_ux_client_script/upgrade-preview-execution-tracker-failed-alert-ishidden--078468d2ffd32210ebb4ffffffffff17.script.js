/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const activityState = api.context.props.activityState.value;
  
  // 0-Pending, 1-Running, 2-Successful, 3-Failed, 4-Cancelled
  return !['3', '4'].includes(api.state.upgradePreviewExecutionTrackerState)
    || activityState !== 'IN_PROGRESS';
}
