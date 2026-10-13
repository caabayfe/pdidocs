function getSearchTermBreakdownId(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.breakdown_id) ? event.breakdown_id : null;
    } catch (e) {
        return null;
    }
}
getSearchTermBreakdownId(current.event_payload);
