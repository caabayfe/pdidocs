function getEventId(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.event_id) ? event.event_id : null;
    } catch (e) {
        return null;
    }
}
getEventId(current.event_payload);
