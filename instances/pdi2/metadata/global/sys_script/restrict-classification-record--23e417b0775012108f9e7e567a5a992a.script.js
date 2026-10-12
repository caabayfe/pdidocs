(function executeRule(current, previous /*null when async*/ ) {
    var maxRowCount = gs.getProperty('com.glide.notification.classifier.max_record', 100);
    var gg = new GlideRecord("sys_notification_classification");
    gg.query();
    if (gg.getRowCount() >= maxRowCount) {
        gs.addErrorMessage(gs.getMessage("Maximum row count limit of {0} exceeded. Remove some records to add new ones.", maxRowCount));
        current.setAbortAction(true);
    }
})(current, previous);
