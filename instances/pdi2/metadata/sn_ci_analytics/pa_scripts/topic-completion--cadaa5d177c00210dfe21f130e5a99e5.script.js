function topicCompletion(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        if (!gs.nil(event) && !gs.nil(event.topic_completed))
            return event.topic_completed == "true" ? 1 : 0;
        else
            return null;
    } catch (e) {
        return null;
    }
}
topicCompletion(current.event_payload);
