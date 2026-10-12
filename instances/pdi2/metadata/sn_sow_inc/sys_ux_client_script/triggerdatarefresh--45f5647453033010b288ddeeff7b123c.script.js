/**
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
    const eventName = event.name;
    
    if (eventName == "NOW_RECORD_LIST_CONNECTED#INLINE_EDITING_VALIDATE_UPDATE_RECORDS_COMPLETED" || event.payload.action.actionType == 'server_script') {
        var jsonObj = [];
        if (api.state.parFilters.length == 0) {
            jsonObj.push({
                "order": 100,
                "type": "boolean",
                "apply_to": ["incident.active"],
                "values": ["true"]
            });
        }
        api.setState('parFilters', () => jsonObj);
            api.setState('listRefreshRequested', {
                timestamp: new Date().getTime()
            });
    }
}
