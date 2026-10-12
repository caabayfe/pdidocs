/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const alertmsg = [];
    if (api.state.showMandatoryError && 
        (api.state.selectedUIPage === null || api.state.selectedUIPage.length == 0)) {
        alertmsg.push({
            "status": "critical",
            "icon": "circle-exclamation-outline",
            "content": "Please enter a UI page"
        });
    }
    return alertmsg;
}
