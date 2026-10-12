if (current.approval.changes() && current.approval=='approved') {
  gs.eventQueue("task.approved", current, current.approval, previous.approval);
}

if (current.approval.changes() && current.approval=='rejected') {
  gs.eventQueue("task.rejected", current, current.approval, previous.approval);
}
