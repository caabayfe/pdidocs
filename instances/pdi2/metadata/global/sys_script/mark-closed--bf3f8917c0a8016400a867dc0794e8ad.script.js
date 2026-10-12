setClosureFields();

function setClosureFields() {
	// incident_state is Closed so
	// 1. mark the task as inactive
	// 2. set the closed by to current user if not supplied
	// 3. set the closed time to now if not supplied
	current.active = false;
	if (current.closed_by.nil())
		current.closed_by = gs.getUserID();
	if (current.closed_at.nil())
		current.closed_at = gs.nowDateTime();
	
	// Update the fields that indicate the time/duration of the incident from open to close.
	// Keep track of duration as a glide_duration value (dd hh:mm:ss) and as a pure number of seconds.
	// Both calendar time and business time are maintained.
	
	var dataChange = current.opened_at.changes() || (current.closed_at.changes() && !current.isValidField("resolved_at"));
	var opened = current.opened_at.getDisplayValue();
	var closed = current.closed_at.getDisplayValue();
	
	if (dataChange || current.business_duration.nil())
		current.business_duration = gs.calDateDiff(opened, closed, false);
	
	if (dataChange || current.business_stc.nil())
		current.business_stc = gs.calDateDiff(opened, closed, true);
	
	if (dataChange || current.calendar_duration.nil())
		current.calendar_duration = gs.dateDiff(opened, closed, false);
	
	if (dataChange || current.calendar_stc.nil())
		current.calendar_stc = gs.dateDiff(opened, closed, true);
}
