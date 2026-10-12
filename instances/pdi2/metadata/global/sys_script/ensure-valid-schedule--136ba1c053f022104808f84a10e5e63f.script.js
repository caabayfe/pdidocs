(function executeRule(current, previous /*null when async*/ ) {
	if (current.isActionAborted())
		return;

	// skip validation when deactivating the job
	if (current.operation() == 'update' && previous.active == true && current.active == false)
		return;

	var nextOccurrence;
	var advancedSchedulerUtils = new AdvancedSchedulerUtils();
	if (current.run_type == "periodically") {
		nextOccurrence = advancedSchedulerUtils.getNextOccurrenceForPeriodically(current);
		if (!gs.nil(nextOccurrence)) {
			abortIfNextActionInvalid (nextOccurrence, current);
			return;
		}
	}

	var triggerGr = advancedSchedulerUtils.buildTriggerGr(current);
	if (triggerGr == null)
		return;

	var m = GlideARecurrence.get(triggerGr);
	if (m == null)
		return;

	nextOccurrence = m.next();
    abortIfNextActionInvalid(nextOccurrence, current);
})(current, previous);

function abortIfNextActionInvalid (nextOccurrence, current) {
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
}
