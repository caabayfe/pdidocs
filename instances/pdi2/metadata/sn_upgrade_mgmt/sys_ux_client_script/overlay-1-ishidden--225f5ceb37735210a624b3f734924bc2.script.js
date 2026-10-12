/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return true; // don't show overlay overlay
    
    const activityState = api.data.playbook_activity_ui.playbookCardProperties.activityState.value;
    return activityState == 'IN_PROGRESS';
}
