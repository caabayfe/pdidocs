function getTopicId(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.topic_id) ? event.topic_id : null;
    } catch (e) {
        return null;
    }
}
getTopicId(current.event_payload);
