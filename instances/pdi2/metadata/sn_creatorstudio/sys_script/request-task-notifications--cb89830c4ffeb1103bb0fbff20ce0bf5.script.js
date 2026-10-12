(function executeRule(current, previous /*null when async*/ ) {
      var operation = current.operation();
      if (operation == 'insert' && !current.opened_by.nil()) {
          gs.eventQueue("sn_creatorstudio.req_task.opened", current, gs.getUserID());
      }
      if ((operation == 'insert' || operation == 'update') && (current.assigned_to.changes() && !current.assigned_to.nil())) {
          gs.eventQueue("sn_creatorstudio.req_task.assign.to.user", current, current.assigned_to);
      }
      if ((operation == 'insert' || operation == 'update') && (current.assignment_group.changes() && !current.assignment_group.nil())) {
          gs.eventQueue("sn_creatorstudio.req_task.assign.to.grp", current, current.assignment_group);
      }
      if ((operation == 'insert' || operation == 'update') && (current.active.changes() && !current.active)) {
          gs.eventQueue("sn_creatorstudio.req_task.closed", current, gs.getUserID());
      }})(current, previous);
