/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api
}) {
    var conversationDetails = api.state.conversationDetails;
    if (conversationDetails)
        return conversationDetails.start_date_time;
    return '';
}
