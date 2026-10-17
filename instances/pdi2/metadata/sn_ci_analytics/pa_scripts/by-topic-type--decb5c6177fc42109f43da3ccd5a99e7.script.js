function getType(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.type) ? event.type : null;
    } catch (e) {
        return null;
    }
}
getType(current.event_payload);
