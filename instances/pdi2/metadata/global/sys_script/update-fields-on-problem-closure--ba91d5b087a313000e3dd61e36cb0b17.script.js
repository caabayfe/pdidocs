(function executeRule(current, previous /*null when async*/) {

	current.closed_at = gs.nowDateTime();
	current.closed_by = gs.getUserID();

  current.business_duration = gs.calDateDiff(current.opened_at.getDisplayValue(),current.closed_at.getDisplayValue(),false);
  current.business_stc = gs.calDateDiff(current.opened_at.getDisplayValue(),current.closed_at.getDisplayValue(),true);
  current.calendar_duration = gs.dateDiff(current.opened_at.getDisplayValue(),current.closed_at.getDisplayValue(),false);
  current.calendar_stc = gs.dateDiff(current.opened_at.getDisplayValue(),current.closed_at.getDisplayValue(),true);
	
})(current, previous);
