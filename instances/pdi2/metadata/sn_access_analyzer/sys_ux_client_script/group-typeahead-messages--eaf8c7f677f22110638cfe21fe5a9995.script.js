/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const alertmsg = [];
    if (api.state.showMandatoryError && api.state.selectedGroup === null) {
        alertmsg.push({
            "status": "critical",
            "icon": "circle-exclamation-outline",
            "content": "Please select a group"
        });
    }
    return alertmsg;
}
