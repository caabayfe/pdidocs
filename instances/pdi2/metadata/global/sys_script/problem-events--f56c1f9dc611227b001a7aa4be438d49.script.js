if (current.operation() == 'insert') { 
 gs.eventQueue("problem.inserted", current, gs.getUserID(), gs.getUserName());
}

if (current.operation() == 'update') {
 gs.eventQueue("problem.updated", current, gs.getUserID(), gs.getUserName());
}

if (!current.assigned_to.nil() && current.assigned_to.changes()) {
  gs.eventQueue("problem.assigned", current, current.assigned_to.getDisplayValue() , previous.assigned_to.getDisplayValue());
}

if (current.escalation.changes() && current.escalation > previous.escalation && previous.escalation != -1) {
  gs.eventQueue("problem.escalated", current, current.escalation , previous.escalation );
}
