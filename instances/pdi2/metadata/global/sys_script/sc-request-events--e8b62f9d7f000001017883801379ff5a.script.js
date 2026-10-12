if (current.operation() != 'insert' && current.comments.changes()) {
  gs.eventQueue("sc_request.commented", current, gs.getUserID(), gs.getUserName());
}

if (current.operation() == 'insert') {
 gs.eventQueue("sc_request.inserted", current, gs.getUserID(), gs.getUserName());
}

if (current.operation() == 'update') {
 gs.eventQueue("sc_request.updated", current, gs.getUserID(), gs.getUserName());
}

if (!current.assigned_to.nil() && current.assigned_to.changes()) {
  gs.eventQueue("sc_request.assigned", current, current.assigned_to.getDisplayValue() , previous.assigned_to.getDisplayValue());
}

if (!current.requested_for.nil() && current.requested_for.changes()) {
  gs.eventQueue("sc_request.requested_for", current, current.requested_for.getDisplayValue() , previous.requested_for.getDisplayValue());
}

if (current.approval.changes() && current.approval=='approved') {
  gs.eventQueue("sc_request.approved", current, current.approval, previous.approval);
}

if (current.escalation.changes() && current.escalation > previous.escalation && previous.escalation != -1) {
  gs.eventQueue("sc_request.escalated", current, current.escalation , previous.escalation );
}

if (current.active.changesTo(false)) {
  gs.eventQueue("sc_request.inactive", current, current.stage, previous.stage);
  gs.workflowFlush(current);
}
