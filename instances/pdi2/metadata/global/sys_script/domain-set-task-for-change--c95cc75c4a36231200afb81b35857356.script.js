syncTaskForAndRequestedBy();

function syncTaskForAndRequestedBy() {
   if (current.requested_by.changes()) {
      current.task_for = current.requested_by;
      return;
   }

   current.requested_by = current.task_for;
}
