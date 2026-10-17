(function executeRule(current, previous /*null when async*/) {
	var plannedStartElem = current.start_date;
	var plannedEndElem = current.end_date;
	var plannedStartGDT = plannedStartElem.getGlideObject();
	var plannedEndGDT = plannedEndElem.getGlideObject();

	if (plannedStartGDT.after(plannedEndGDT)) {
		gs.addErrorMessage(gs.getMessage("{0} must be after {1}", [ plannedEndElem.getLabel(), plannedStartElem.getLabel() ]));
		current.setAbortAction(true);
		return;
	}

	// The method of duration calculation is used instead of a condition (in the condition builder)
	// to ensure we use the same method of comparison between client and server
	var FIFTY_YEARS_MILLIS = 1576800000000; // 1000 * 60 * 60 * 24 * 365 * 50
	var duration = GlideDateTime.subtract(plannedStartGDT, plannedEndGDT).getNumericValue();
	if (duration > FIFTY_YEARS_MILLIS) {
		gs.addErrorMessage(gs.getMessage("{0} cannot be more than 50 years after {1}", [ plannedEndElem.getLabel(), plannedStartElem.getLabel() ]));
		current.setAbortAction(true);
	}
})(current, previous);
