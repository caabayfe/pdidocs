function getNotificationState(eventPayload) {
    try {
        var state_bucket_map = {
            'Engaged': 0,
            'Expired': 1
        };
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.state) && !gs.nil(state_bucket_map[event.state]) ? state_bucket_map[event.state] : null;
    } catch (e) {
        return null;
    }
}
getNotificationState(current.event_payload);
