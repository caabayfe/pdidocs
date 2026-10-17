function getParentTopicId(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.parent_topic_id) ? event.parent_topic_id : null;
    } catch (e) {
        return null;
    }
}
getParentTopicId(current.event_payload);
