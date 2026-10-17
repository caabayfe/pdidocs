/**
 * create general events, tables need fields:
 * comments, assigned_to, active
 */
function global_events(current) {
	var name = current.sys_meta.name;
	global_simple_events(current);
	
	if (current.operation() != "insert" && current.comments.changes())
		gs.eventQueue(name + ".commented", current, gs.getUserID(), gs.getUserName());
	
	if (current.isValidField("assigned_to")) {
		if (!current.assigned_to.nil() && current.assigned_to.changes()) {
			gs.eventQueue(name + ".assigned", current, current.assigned_to.getDisplayValue(),
			previous.assigned_to.getDisplayValue());
		}
	}
	
	if (current.operation() != 'insert' && current.active.changesTo(false)) {
		// if incident_state is valid then use that, to avoid sending back a different value from previous release
		if (current.isValidField("incident_state"))
			gs.eventQueue(name + ".inactive", current, current.incident_state, previous.incident_state);
		else if (current.isValidField("state"))
			gs.eventQueue(name + ".inactive", current, current.state, previous.state);
	}
}

/**
 * do the inserted, updated events
 */
function global_simple_events(current) {
	var name = current.sys_meta.name;
	if (current.operation() == "insert")
		gs.eventQueue(name + ".inserted", current, gs.getUserID(), gs.getUserName());
	if (current.operation() == "update")
		gs.eventQueue(name + ".updated", current, gs.getUserID(), gs.getUserName());
}
