var task = current.task;
var field = current.field;

if (task) {
   // maybe at least we have a task
   var taskGr = new GlideRecord("task");
   taskGr.get(task.sys_id);
   var value = JSUtil.nil(taskGr.getValue(field));
   if (value) {
      gs.addErrorMessage(gs.getMessage('You asked to be notified before the task {0}, but that field is currently empty.', field));
      current.setAbortAction(true);
   } else {
     isValid = true;
   }
} else {
  // no task
      gs.addErrorMessage(gs.getMessage('You asked to be notified about a non existent or empty task. That is beyond our skills.'));
      current.setAbortAction(true);
}

if (!current.isActionAborted()) {
   // tell our parent that he has at least one child
   var temp = current.task.sys_id;
   var target = new GlideRecord('task');
   target.addQuery("sys_id", temp);
   target.query();
   if (target.next()) {
     var fields = "due_date,sla_due,activity_due,follow_up,active";
     var className ="com.glide.listener.TaskChildNotifier";
     target.attachGlideListener(className, true, true, true, fields, null);
   }
   // set ourselves up and pass in our parent as, well, our parent
  var fields = "task,subject,user,remind_me,using,field,notes";
  var className ="com.glide.listener.ReminderSynchronizer";
  current.attachGlideListener(className, true, true, true, fields, target);

}
