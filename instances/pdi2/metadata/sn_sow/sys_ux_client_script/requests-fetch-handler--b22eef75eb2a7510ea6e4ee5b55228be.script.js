/**
 * Requests Fetch Handler
 * 
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const payload = {
        name: event.name,
        elementId: event.elementId,
        payload: event.payload
    };

    if (payload.name === "DATA_FETCH_SUCCEEDED") {
        const { output } = api.data.sow_team_mgmt_lookup_requests;
        api.setState('requests', output);
    }
}
