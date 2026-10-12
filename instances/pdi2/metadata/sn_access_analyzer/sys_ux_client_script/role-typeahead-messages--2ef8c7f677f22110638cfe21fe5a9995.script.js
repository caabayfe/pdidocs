/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const alertmsg = [];
    if (api.state.showMandatoryError && api.state.selectedRole === null) {
        alertmsg.push({
            "status": "critical",
            "icon": "circle-exclamation-outline",
            "content": "Please select a role"
        });
    }
    return alertmsg;
}
