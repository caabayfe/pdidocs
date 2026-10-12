current.active = false;
if(!current.work_end)
	current.work_end = nowDateTime();
current.business_duration = gs.calDateDiff(current.work_start.getDisplayValue(),current.work_end.getDisplayValue(),false);
current.calendar_duration = gs.dateDiff(current.work_start.getDisplayValue(),current.work_end.getDisplayValue(),false);
