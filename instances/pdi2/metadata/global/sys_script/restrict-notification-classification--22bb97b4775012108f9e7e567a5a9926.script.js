(function executeRule(current, previous /*null when async*/ ) {
    var maxClassificationCount = gs.getProperty('com.glide.notification.max_notification_classifiers', 5);
    var notificationClassification = current.getValue('notification_classifier');
    if (!gs.nil(notificationClassification)) {
        var commaCount = ((notificationClassification.match(/,/g) || []).length) + 1;
        if (commaCount > maxClassificationCount) {
            gs.addErrorMessage(gs.getMessage("Maximum limit of {0} reached for classifiers associated with this notification. Remove some to add more.", maxClassificationCount));
            current.setAbortAction(true);
        }
    }
})(current, previous);
