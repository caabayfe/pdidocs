/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        groupValues
    } = api.state.activityForm.fields;

    return !api.state.projectPermissions.promin_activity_def.canWrite || api.state.projectDetails.ismining || groupValues.disabled;
}
