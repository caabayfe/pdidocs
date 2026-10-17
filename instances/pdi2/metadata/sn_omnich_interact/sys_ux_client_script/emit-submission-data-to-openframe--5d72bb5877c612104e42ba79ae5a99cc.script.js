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
    api.emit("RECORD#OPEN_CALL", {
        "route": "cti",
        "params": {
            "source": "wrap_up"
        },
        "callPayload": {
            "type": "wrap_up_event",
            "subType": "ended",
            "data": {
                "recordTable": "interaction",
                "recordId": api.context.props.interactionSysId,
                "wrapUpSegmentId": api.state.segmentId,
                "external": api.state.segmentJson.external,
                "externalSegmentId": api.state.segmentJson.external_segment_id,
                "wrapUpCode": event.payload.wrapUpCode,
                "wrapUpNotes": event.payload.notes
            }
        }
    });
}
