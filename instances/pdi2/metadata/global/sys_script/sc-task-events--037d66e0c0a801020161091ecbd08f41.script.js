if (current.operation() != 'insert' && current.comments.changes()) {
   gs.eventQueue("sc_task.commented", current, gs.getUserID(), gs.getUserName());
}

if (current.operation() != 'insert' && current.work_notes.changes()) {
   gs.eventQueue("sc_task.worknoted", current, gs.getUserID(), gs.getUserName());
}

if (current.operation() == 'update') {
   gs.eventQueue("sc_task.updated", current, gs.getUserID(), gs.getUserName());
}

if (current.state.changes() ) {
   gs.eventQueue("sc_task.state.changed", current, current.state, previous.state);
}

if (current.assigned_to.changes() || current.work_start.changes()) {
   gs.eventQueue("sc_task.assigned.to.user", current, current.assigned_to.getDisplayValue() , previous.assigned_to.getDisplayValue());
}

if (current.assignment_group.changes() || current.work_start.changes()) {
   gs.eventQueue("sc_task.assigned.to.group", current, current.assignment_group.getDisplayValue() , previous.assignment_group.getDisplayValue());
}
