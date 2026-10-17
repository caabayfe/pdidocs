function getIntentSelection(eventPayload) {
    try {
        var event = JSON.parse(eventPayload);
        var eventName = !gs.nil(event) && !gs.nil(event.name) && event.name;
        switch (eventName) {
            case 'Intent Auto Selected':
                return 0;
            case 'Intent Correctly Detected':
                return 100;
            case 'Intent Incorrectly Detected':
                return 200;
            case 'Intent Unsupported':
                return 300;
            default:
                return null;
        }
    } catch (e) {
        return null;
    }
}
getIntentSelection(current.event_payload);
