var indicatorExists = SNC.PAScore.indicatorSourceIsReferencedByIndicators(current.sys_id);

if (indicatorExists) {
	if (current.frequency.changes()) {	
		gs.addErrorMessage(gs.getMessage("Frequency can't be changed because there are Indicators using this Indicator source"));	
		current.setAbortAction(true);	
	} else if (current.calendar.changes()) {	
		// If its a change from emptyValue to standard Calendar, we need to bypass this change.	
		if (!(current.calendar.changesFrom('') && current.calendar.changesTo('standard'))) {	
				gs.addErrorMessage(gs.getMessage("Calendars can't be changed because there are Indicators using this Indicator source"));	
				current.setAbortAction(true);	
		}	
	} else if (current.calendar_freq.changes()) {	
		gs.addErrorMessage(gs.getMessage("Calendar Frequency can't be changed because there are Indicators using this Indicator source"));	
		current.setAbortAction(true);	
	}
} else if (SNC.PAScore.indicatorSourceHasScores(current.sys_id)) {
	gs.addErrorMessage(gs.getMessage("Frequency and Facts table cannot be changed because there are Indicators using this Indicator source that have scores"));
	current.setAbortAction(true);
}
