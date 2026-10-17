if (current.operation() == 'insert')
   gs.eventQueue("problem_task.inserted", current, gs.getUserID(), gs.getUserName());

if (current.operation() != 'insert' && current.comments.changes())
   gs.eventQueue("problem_task.commented", current, gs.getUserID(), gs.getUserName());

if (current.operation() != 'insert' && current.work_notes.changes())
   gs.eventQueue("problem_task.worknoted", current, gs.getUserID(), gs.getUserName());

if (current.operation() == 'update')
   gs.eventQueue("problem_task.updated", current, gs.getUserID(), gs.getUserName());

if (current.state.changes())
   gs.eventQueue("problem_task.state.changed", current, current.state, previous.state);

if (!current.assigned_to.nil() && current.assigned_to.changes())
   gs.eventQueue("problem_task.assigned", current, current.assigned_to.getDisplayValue() , previous.assigned_to.getDisplayValue());

if (!current.assignment_group.nil() && current.assignment_group.changes())
   gs.eventQueue("problem_task.assigned.to.group", current, current.assignment_group.getDisplayValue() , previous.assignment_group.getDisplayValue());
