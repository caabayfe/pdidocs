if (current.operation() === 'insert')
	gs.eventQueue("change.inserted", current, gs.getUserID(), gs.getUserName());

if (current.operation() === 'update')
	gs.eventQueue("change.updated", current, gs.getUserID(), gs.getUserName());

if (!current.assigned_to.nil() && current.assigned_to.changes())
	gs.eventQueue("change.assigned", current, current.assigned_to.getDisplayValue(), previous.assigned_to.getDisplayValue());

if (current.priority.changes() && current.getValue('priority') === '1')
	gs.eventQueue("change.priority.1", current, current.priority, previous.priority);

if (current.risk.changes() && current.getValue('risk') === '1')
	gs.eventQueue("change.risk.1", current, current.risk, previous.risk);

if (current.start_date.changes() || current.end_date.changes() || current.assigned_to.changes()) {
	if (!current.start_date.nil() && !current.end_date.nil() && !current.assigned_to.nil())
		gs.eventQueue("change.calendar.notify", current, current.assigned_to, previous.assigned_to);

	// Remove from previous assigned to, due to assigned_to changing
	if (!previous.assigned_to.nil() && current.assigned_to.changes()) {
		if (!previous.start_date.nil() && !previous.end_date.nil() && !current.start_date.nil() && !current.end_date.nil())
			gs.eventQueue("change.calendar.notify.remove", current, current.assigned_to, previous.assigned_to);
	}
}

var changeRequestObj = new ChangeRequest(current);

if (current.state.changes() && changeRequestObj.isCanceled()) {
	if (!current.assigned_to.nil())
		gs.eventQueue("change.calendar.notify.remove", current, current.assigned_to, current.assigned_to);
	else {
		if (!previous.assigned_to.nil())
			gs.eventQueue("change.calendar.notify.remove", current, previous.assigned_to, previous.assigned_to);
	}
}

	new ChangeManagementEventUtil().generateStateUpdatedEvent(current, previous);
