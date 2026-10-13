function getConversationEndState(eventPayload) {
    try {
        var endStates = {
            "System Closed LA – Chat Complete": "8",
            "User Closed LA - Before Agent Engagement": "10",
            "System Closed VA – Topic Complete": "2",
            "System closed VA – Auto Closed": "4",
            "System Closed LA – User No Response": "7",
            "System Closed VA – User Never Engaged": "5",
            "Agent Closed LA – Clicked End/X": "9",
            "System Closed VA – Left With AI Search": "3",
            "User Closed VA – Clicked End/X": "0",
            "System Closed LA – Before Agent Engageme": "11",
            "System Closed VA – User No Response": "1",
            "User Closed LA – Clicked End/X": "6"
        };
        var event = JSON.parse(eventPayload);
        return !gs.nil(event) && !gs.nil(event.conversation_end_state) && !gs.nil(endStates[event.conversation_end_state]) ? endStates[event.conversation_end_state] : null;
    } catch (e) {
        return null;
    }
}
getConversationEndState(current.event_payload);
