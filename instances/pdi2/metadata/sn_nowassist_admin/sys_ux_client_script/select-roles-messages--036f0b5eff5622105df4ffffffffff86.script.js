/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var showAlert = api.state.selectedRoles.length === 0;
    if (showAlert) {
        return [{
            "icon": "exclamation-triangle-outline",
            "status": "critical",
            "content": helpers.translateSync("At least 1 role must be selected for a skill. If you do not wish to define any role, you may select ‘Any authenticated user’.")
        }];
    } else {
        return [{
            "icon": "circle-info-outline",
            "status": "info",
            "content": helpers.translateSync("Role changes will be saved and applied to the skill.")
        }];
    }
}
