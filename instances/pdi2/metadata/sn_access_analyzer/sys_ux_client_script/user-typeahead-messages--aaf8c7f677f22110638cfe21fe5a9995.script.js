/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const alertmsg = [];
    if (api.state.showMandatoryError && api.state.selectedUser === null) {
        alertmsg.push({
            "status": "critical",
            "icon": "circle-exclamation-outline",
            "content": api.state.translatedMessages.userTypeaheadAlert
        });
    }
    return alertmsg;
}
