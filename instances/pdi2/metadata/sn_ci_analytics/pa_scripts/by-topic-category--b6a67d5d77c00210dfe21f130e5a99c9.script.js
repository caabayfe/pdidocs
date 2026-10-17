function getTopicCategoryId(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.topic_category_id) ? event.topic_category_id.split(',') : null;
    } catch (e) {
        return null;
    }
}
getTopicCategoryId(current.event_payload);
