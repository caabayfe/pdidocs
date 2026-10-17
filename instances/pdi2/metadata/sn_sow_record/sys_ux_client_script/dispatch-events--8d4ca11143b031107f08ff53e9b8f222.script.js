/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const eventName = event.name;

    switch (eventName) {

        case 'LIST_CTRL#REFERENCE_LINK_CLICKED':
            api.emit("SOW_RELATED_RECORD#PREVIEW_RECORD", event.payload);
            break;

        case 'LIST_CTRL#DA_WRAPPED_CLICKED':
            api.emit(event.payload.wrappedAction, event.payload.wrappedPayload);
            captureMetricsForSimiliarIncidents(event.payload);
            break;
            
        default:
            break;
    }

    function captureMetricsForSimiliarIncidents(payload) {
        if (payload.wrappedAction === 'OPEN_SIMILAR_INCIDENTS_MRA') {
             api.emit("MACROPONENT_TRACK_USAGE_REQUESTED", {
                "event": "MIM Find Similar Incidents",
                "value": {
                    "Context": "MIM similar incidents action clicked"
                }
            });
        }
    };
}
