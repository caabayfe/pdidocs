(function executeRule(current, previous /*null when async*/ ) {
    // dispatch a notification to the UI to refresh the navigator
    var notification = new UINotification('system_event');
    notification.setAttribute('event', 'refresh_nav');
    notification.send();
})(current, previous);
