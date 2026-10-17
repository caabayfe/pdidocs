if (!current.isActionAborted()) {
   var temp = current.task.sys_id;
   var target = new GlideRecord('task');
   target.addQuery("sys_id", temp);
   target.query();
   if (target.next()) {
     var fields = "due_date,sla_due,activity_due,follow_up";
     var className ="com.glide.listener.ReminderSynchronizer";
     target.attachGlideListener(className, true, true, true, fields, current);            
   }
   
}
