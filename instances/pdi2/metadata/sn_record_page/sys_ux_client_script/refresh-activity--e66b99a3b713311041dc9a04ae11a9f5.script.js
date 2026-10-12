function script({api, event}) {
    api.setState('activityRefreshRequested', event.payload.timestamp || Date.now());
}
