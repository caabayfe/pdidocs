function isTopicCategoryCompleted(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        if (!gs.nil(event) && !gs.nil(event.topic_category_completed))
            return event.topic_category_completed == "true" ? 1 : 0;
        else
            return null;
    } catch (e) {
        return null;
    }
}
isTopicCategoryCompleted(current.event_payload);
