/* This relative duration script will set the Breach Time of the Task SLA to the value in the "Due date" of the Task.


   If the "Due date" field is available on the Task form and editable then this effectively allows the user to specify the
   Breach Time of the SLA.
   
   If the Due Date field is empty or in the past, the script will instead set the Breach Time of the SLA to 1 second
   after the Start time
*/

(function() {
  var startDateMs = calculator.startDateTime.getNumericValue();
  var dueDate;

  // Work out if "current" is a Task record or Task SLA and then get the "due_date" element from the Task
  var tableName = current.getTableName();
  if (tableName) {
       var baseTableName = GlideDBObjectManager.getAbsoluteBase(tableName);
       if (baseTableName == "task")
            dueDate = current.getElement("due_date");
       else if (baseTableName == "task_sla")
            dueDate = current.getElement("task.due_date");
  }

  // if we've got a "due_date" and it's after our SLA's Start time then use it
  // otherwise we'll have to default to the same as Start Time plus 1 second (i.e. instant breach of SLA)
  if (dueDate && !dueDate.nil() && dueDate.dateNumericValue() > startDateMs)
       dueDate = dueDate.getGlideObject();
  else {
       dueDate = new GlideDateTime(calculator.startDateTime);
       dueDate.addSeconds(1);
  }

  // if we have a schedule then check if the Due Date is in it and if it isn't
  // find the next time we are in the schedule
  if (calculator.schedule && !calculator.schedule.isInSchedule(dueDate))
       dueDate.add(calculator.schedule.whenNext(dueDate, calculator.timezone));

  // set the endDateTime property of the calculator object to dueDate
  calculator.endDateTime = dueDate;
  calculator.calcScheduleDuration();
})();
