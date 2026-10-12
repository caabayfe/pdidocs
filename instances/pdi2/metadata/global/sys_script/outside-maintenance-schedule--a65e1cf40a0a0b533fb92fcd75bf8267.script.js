/***
 * Sets the outside_maintenance_schedule field on change_requests that use this CI.
 **/

var msc = new MaintenanceScheduleCalculator();
msc.setNoMessages(true); // we don't want warnings

// get all the change_requests that have this CI as the primary CI
var changeGR = new GlideRecord("change_request");
changeGR.addQuery("cmdb_ci", current.sys_id);
changeGR.addActiveQuery();
changeGR.query();
while (changeGR.next()) {
   var inSchedule = msc.checkChangeAgainstSchedules(changeGR, "primary");
   if (changeGR.outside_maintenance_schedule != !inSchedule) {
      changeGR.outside_maintenance_schedule = !inSchedule;
      // we don't want to re-evaluate outside maint again when the usual before event
      // runs on the change_request record so turn it off before we update
      changeGR.setWorkflow(false); 
      changeGR.update();
   }
}

// get all the change_requests that have this CI as an affected CI
var taskCiGR = new GlideRecord("task_ci");
taskCiGR.addQuery("ci_item", current.sys_id);
taskCiGR.addQuery("task.active", true);
taskCiGR.query();
while (taskCiGR.next()) {
   var changeGR = new GlideRecord("change_request");
   if (changeGR.get(taskCiGR.task)) {
      if (changeGR.active) {
         var inSchedule = msc.checkChangeAgainstSchedules(changeGR, current.sys_id);
         if (changeGR.outside_maintenance_schedule != !inSchedule) {
            changeGR.outside_maintenance_schedule = !inSchedule;
            // we don't want to re-evaluate outside maint again when the usual before event
            // runs on the change_request record so turn it off before we update
            changeGR.setWorkflow(false);
            changeGR.update();
         }
      }
   }
}
