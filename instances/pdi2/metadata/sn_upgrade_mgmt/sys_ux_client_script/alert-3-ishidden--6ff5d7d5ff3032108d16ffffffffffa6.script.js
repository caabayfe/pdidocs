/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const activityState = api.data.playbook_activity_ui.playbookCardProperties.activityState.value;

  // 0-Pending, 1-Running, 2-Successful, 3-Failed, 4-Cancelled
  // HIDE IF 
  // 1. Preview preview is not successful
  // 2. When we are making the request
  // 3. This step is not in progress
  return !['2'].includes(api.state.upgradePreviewExecTrackerState) || api.state.retryingUpgradePreview || activityState !== 'IN_PROGRESS';;
}
