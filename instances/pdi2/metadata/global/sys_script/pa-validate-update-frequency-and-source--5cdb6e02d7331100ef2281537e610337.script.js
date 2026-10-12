
if (current.calendar.changes()) {
	/**
		If calendar field changes, the only allowed change is from empty value to standard.
	**/
	if (!(current.calendar.changesFrom('') && current.calendar.changesTo('standard'))) {
		gs.addErrorMessage(gs.getMessage("Calendars cannot be changed because this indicator has scores"));
	current.setAbortAction(true);
	}
} else if (current.calendar_freq.changes()) {
	gs.addErrorMessage(gs.getMessage("Calendar Frequency cannot be changed because this indicator has scores"));
	current.setAbortAction(true);
} else if (current.frequency.changes()) {
	gs.addErrorMessage(gs.getMessage("Frequency cannot be changed because this indicator has scores"));
	current.setAbortAction(true);
} else if (current.cube.changes()) {
	gs.addErrorMessage(gs.getMessage("Indicator Source cannot be changed because this indicator has scores"));
	current.setAbortAction(true);
}
