function getChannelId(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.channel) ? event.channel : null;
    } catch (e) {
        return null;
    }
}
getChannelId(current.event_payload);
