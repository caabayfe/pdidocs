(function executeRule(current, previous /*null when async*/ ) {
    var grScheduledTask = current.scheduled_task.getRefRecord();
    if (grScheduledTask.isValidRecord()) {
        grScheduledTask.deleteRecord();
    }
})(current, previous);
