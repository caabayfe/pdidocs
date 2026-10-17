function include({
    imports
}, api = {}) {
    return {
        trackUsage: (eventName, eventPayload) => {
            api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                event: eventName,
                value: eventPayload
            });
        }
    }
}
