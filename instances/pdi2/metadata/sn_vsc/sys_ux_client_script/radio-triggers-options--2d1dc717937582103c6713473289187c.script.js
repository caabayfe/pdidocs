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
    let events = [];
    for (const record of eventTypes) {
        events.push({
            id: record.id,
            label: record.name
        });
    }
    return events;
}
