/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var eventTypes = api?.data?.get_policy_event_type?.output || [];
    let message = '';
    for (const record of eventTypes) {
        if (record.id == api.state.radioItemSelected) {
            message = record.description;
        }
    }
    return message;
}
