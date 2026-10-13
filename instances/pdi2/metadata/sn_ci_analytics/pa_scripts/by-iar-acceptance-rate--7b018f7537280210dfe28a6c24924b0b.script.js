function getAcceptanceRate(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.acceptance_id) ? event.acceptance_id : null;
    } catch (e) {
        return null;
    }
}
getAcceptanceRate(current.event_payload);
