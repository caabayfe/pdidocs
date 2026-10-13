if (current.state.changesTo("resolved")) {
	current.resolved_at = gs.nowDateTime();
	current.resolved_by = gs.getUserID();
	current.actual_disruption_time = gs.dateDiff(current.opened_at.getDisplayValue(),current.resolved_at.getDisplayValue(),false);
}
