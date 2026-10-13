function getSubflow(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.action_id) ? event.action_id : null;
    } catch (e) {
        return null;
    }
}
getSubflow(current.event_payload);
