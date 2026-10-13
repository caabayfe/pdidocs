(function executeRule(current, previous /*null when async*/ ) {

    var maxReminderCount = parseInt(gs.getProperty("com.snc.on_call_rotation.max_rotation_reminder_count", 50));
    if (isNaN(maxReminderCount)) {
      maxReminderCount = 50; // Set to default as 50 is maxReminderCount is NaN
    }
    if (parseInt(current.attempts) > maxReminderCount) {
        gs.addErrorMessage(gs.getMessage("Number of reminders should not be greater than {0}", [maxReminderCount]));
        current.setAbortAction(true);
    }

})(current, previous);
