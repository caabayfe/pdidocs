/***
 * Sets the outside_maintenance_schedule field on change_requests that have a CI that use 
 * this maintenance schedule. 
 **/
var msc = new MaintenanceScheduleCalculator();
msc.setNoMessages(true); // we don't want warnings

// get all the CIs that use this schedule
var ciGR = new GlideRecord("cmdb_ci");
ciGR.addQuery("maintenance_schedule", current.schedule);
ciGR.query();
while (ciGR.next()) {

   // get all the change_requests that have this CI as the primary CI
   var changeGR = new GlideRecord("change_request");
   changeGR.addQuery("cmdb_ci", ciGR.sys_id);
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
   taskCiGR.addQuery("ci_item", ciGR.sys_id);
   taskCiGR.addQuery("task.active", true);
   taskCiGR.query();
   while (taskCiGR.next()) {
      var changeGR = new GlideRecord("change_request");
      if (changeGR.get(taskCiGR.task)) {
         if (changeGR.active) {
            var inSchedule = msc.checkChangeAgainstSchedules(changeGR, ciGR.sys_id);
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
}
