/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // These are the record pages for which the AIS sub tab should be shown.
    switch (api.context.props.contextTable) {
        case 'change_request':
        case 'change_task':
        case 'incident':
        case 'incident_task':
        case 'interaction':
        case 'problem':
        case 'problem_task':
        case 'sc_request':
        case 'sc_req_item':
        case 'sc_task':
            return false;
    }
    return true;
}
