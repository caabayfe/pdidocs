syncTaskForAndCallerID();

function syncTaskForAndCallerID() {
   if (current.caller_id.changes()) {
      current.task_for = current.caller_id;
      return;
   }

   current.caller_id = current.task_for;
}
