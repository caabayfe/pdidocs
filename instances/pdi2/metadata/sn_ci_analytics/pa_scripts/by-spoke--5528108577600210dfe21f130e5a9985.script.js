function getSpoke(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.spoke) ? event.spoke : null;
    } catch (e) {
        return null;
    }
}
getSpoke(current.event_payload);
