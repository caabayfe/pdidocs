(function executeRule(current, previous /*null when async*/) {
	var areDatesWithinRange = function(startRangeDate, endRangeDate, dates){
		for (var i=0; i < dates.length; i++){
			if (!dates[i])
				continue;
			if (gs.dateDiff(startRangeDate, dates[i], true) < 0 || gs.dateDiff(endRangeDate, dates[i], true) > 0)
				return false;
		}
		return true;
	};
	var startDate = current.planned_start_date.getDisplayValue();
	var endDate = current.planned_end_date.getDisplayValue();

	// check end date is not before start date
    if (gs.dateDiff(endDate, startDate, true) > 0){
		gs.addErrorMessage(gs.getMessage("{0} must be after {1}", [ current.planned_end_date.getLabel(), current.planned_start_date.getLabel() ]));
		current.setAbortAction(true);
	}
	// check change task planned dates are within the parent change request planned dates
	if (current.change_task_type == "implementation"){
		var changeStartDate = current.change_request.start_date.getDisplayValue();
		var changeEndDate = current.change_request.end_date.getDisplayValue();
		if (!areDatesWithinRange(changeStartDate, changeEndDate, [startDate, endDate])){
			gs.addErrorMessage(gs.getMessage("Change task planned start and end dates must fall within the planned start and end dates of the change request it is related to"));
			current.setAbortAction(true);
		}
	}
})(current, previous);
