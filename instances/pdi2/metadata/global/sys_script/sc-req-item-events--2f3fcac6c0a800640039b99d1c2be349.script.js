if (current.operation() == 'insert') {
 gs.eventQueue("sc_req_item.inserted", current, gs.getUserID(), gs.getUserName());
}

if (current.operation() == 'update') {
 gs.eventQueue("sc_req_item.updated", current, gs.getUserID(), gs.getUserName());
}

if (current.operation() == 'update' && current.stage == "delivery") {
 gs.eventQueue("sc_req_item.delivery", current, gs.getUserID(), gs.getUserName());
}

if (!current.assigned_to.nil() && current.assigned_to.changes()) {
  gs.eventQueue("sc_req_item.assigned", current, current.assigned_to.getDisplayValue() , previous.assigned_to.getDisplayValue());
}

if (current.stage.changes()) {
  gs.eventQueue("sc_req_item.change.stage", current, current.stage, previous.stage);
}
