/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const alertmsg = [];
    if (api.state.showMandatoryError && 
        (api.state.selectedRESTEndpoint === null || api.state.selectedRESTEndpoint.length == 0)) {
        alertmsg.push({
            "status": "critical",
            "icon": "circle-exclamation-outline",
            "content": "Please enter a rest endpoint url"
        });
    }
    return alertmsg;
}
