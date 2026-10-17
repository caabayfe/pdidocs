(function executeRule(current, previous /*null when async*/ ) {
    var enteredClassifier = current.getValue('name');
    var gg = new GlideRecord("sys_notification_classification");
    gg.addQuery("name", enteredClassifier);
    gg.query();
    if (gg.getRowCount() > 0 && gg.next().getUniqueValue() != current.getValue('sys_id')) {
        gs.addErrorMessage(gs.getMessage("Notification classifier name should be unique."));
        current.setAbortAction(true);
    }

})(current, previous);
