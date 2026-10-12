(function executeRule(current, previous /*null when async*/ ) {
    if (current.isActionAborted())
        return;

    if (!current.next_action.nil())
        return;

    var m = GlideARecurrence.get(current);
    if (m == null) {
        current.next_action = gs.nowDateTime();
        return;
    }

    var nextOccurrence = m.next();
    var end = current.run_end;
    var maxDrift = current.max_drift;
    if (end && maxDrift) {
        var driftTime = new GlideDateTime(maxDrift);
        var endTime = new GlideDateTime(end);
        endTime.add(driftTime.getNumericValue());
        end = endTime;
    }

	var advancedSchedulerUtils = new AdvancedSchedulerUtils();
    if (advancedSchedulerUtils.isNextActionInvalid(nextOccurrence, end)) {
        current.setAbortAction(true);
        return;
    }

    current.setValue('next_action', nextOccurrence);

})(current, previous);
