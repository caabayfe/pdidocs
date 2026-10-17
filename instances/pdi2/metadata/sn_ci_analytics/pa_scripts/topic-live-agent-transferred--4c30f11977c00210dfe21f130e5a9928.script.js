function isLiveAgentTransferred(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        if (!gs.nil(event) && !gs.nil(event.live_agent_transfer))
            return event.live_agent_transfer == "true" ? 1 : 0;
        else
            return null;
    } catch (e) {
        return null;
    }
}
isLiveAgentTransferred(current.event_payload);
