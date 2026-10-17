function getIARUsageStatus(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        if (!gs.nil(event) && !gs.nil(event.usage_status))
            return event.usage_status == "Resolved" ? 0 : 100;
        else
            return null;
    } catch (e) {
        return null;
    }
}
getIARUsageStatus(current.event_payload);
