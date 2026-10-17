(function runAction(/*GlideRecord*/ current, /*GlideRecord*/ event, /*EmailWrapper*/ email, /*ScopedEmailLogger*/ logger, /*EmailClassifier*/ classifier) {
    var unsubscribeJson = email.body.unsubscribe;
    if (!unsubscribeJson) {
		logger.warn("An unsubscribe request with no unsubscribe field");
        return;
	}

    var unsubscribeMap = new JSON().decode(unsubscribeJson);

    if (!unsubscribeMap) {
		logger.warn("An unsubscribe request with an invalid unsubscribe field");
        return;
	}

    var unsubToken = gs.getProperty('glide.notification.unsubscribe_inbound_action_token', 'c797e62132');

    var incomingToken = (unsubscribeMap.token || unsubscribeMap.unsub_token);
    if (unsubToken != incomingToken) {
        logger.warn("An unsubscribe request with an invalid ServiceNow unsubscribe ID");
        return;
    }

    var notificationId = (unsubscribeMap.id || unsubscribeMap.notification_id);
    if (notificationId) {
        var notificationUnsubscribe = new NotificationUnsubscribe();

        var user = GlideUser.getSysIdByEmail(email.fromAddress);
		var unsubscribeResult;
		if(user == null)
			unsubscribeResult = notificationUnsubscribe.unsubscribeSecondaryEmailDevice(notificationId, "email", email.fromAddress);
		else
			unsubscribeResult = notificationUnsubscribe.unsubscribe(notificationId, "email");

        logger.log("Unsubscribe result: " + unsubscribeResult.header + " - " + unsubscribeResult.message, 'NotificationUnsubsribe');
    } else {
        logger.warn("An unsubscribe request with an invalid notification ID");
    }

    event.state = "stop_processing";

})(current, event, email, logger, classifier);
