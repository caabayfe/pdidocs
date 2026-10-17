/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const activityState = api.data.playbook_activity_ui.playbookCardProperties.activityState.value;
    let assignedTo = api.data.playbook_activity_ui.playbookCardProperties.assignedTo;
    if (assignedTo) {
        assignedTo = assignedTo.value;
    }
    let currentUser = api.context.session.user;

    /** The overlay will be hidden in following cases:
     * 1. when task is in progress and
     * 2. assigned to no user or
     * 3. assigned to current logged in user or
     * 4. admin and maint always have access to all the task
     */
    return (activityState === 'IN_PROGRESS') && (!assignedTo || assignedTo === currentUser.sys_id || currentUser.userName === 'maint' || currentUser.userName === 'admin');
}
