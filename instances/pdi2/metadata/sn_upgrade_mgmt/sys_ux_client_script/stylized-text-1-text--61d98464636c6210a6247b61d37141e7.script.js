/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var upgradePreviewState = api.state.upgradePreviewState;

    const activityState = api.data.playbook_activity_ui.playbookCardProperties.activityState.value;
    upgradePreviewState = activityState === 'COMPLETE' && upgradePreviewState === 'running'
      ? 'successful'
      : upgradePreviewState;

    return 'Processing Upgrade Plan ' + (upgradePreviewState === 'running' ? '' : upgradePreviewState);
}
