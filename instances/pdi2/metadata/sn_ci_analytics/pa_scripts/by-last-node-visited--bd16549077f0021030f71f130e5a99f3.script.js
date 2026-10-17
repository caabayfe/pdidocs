function getLastVisitedNode(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.last_visited_node) ? event.last_visited_node : null;
    } catch (e) {
        return null;
    }
}
getLastVisitedNode(current.event_payload);
