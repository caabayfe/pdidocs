/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return !api.state.projectPermissions.promin_project_entity.fields.custom_start_condition.canWrite;
}
