/**
 Service-now.com
 
 Description: 
 Allows for the modifications of task_time_worked values to update the task timer field. 
 Typically the timer is self controlled based on a cumulative value so changing a task time worked value will make the task timer appear inaccurate.
 Requires setting property 'com.snc.time_worked.update_task_timer' to true
**/

var msg = new TaskTimer().updateTaskTimer(current.task.getRefRecord(), current.operation() == 'delete');
if (msg)
	gs.addInfoMessage(msg);
