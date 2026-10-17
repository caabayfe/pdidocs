function getEventTypeId(eventPayload) {
    try {
        var event = JSON.stringify(eventPayload);
        return !gs.nil(event) && !gs.nil(event.event_type_id) ? event.event_type_id : null;
    } catch (e) {
        return null;
    }
}
getEventTypeId(current.event_payload);
