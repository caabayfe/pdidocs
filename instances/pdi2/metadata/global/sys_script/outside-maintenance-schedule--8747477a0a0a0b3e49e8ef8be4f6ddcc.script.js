/***
 * Sets the outside_maintenance_schedule field on change_request records based on the 
 * schedule for the associated CI and any affected CIs.
 **/
var msc = new MaintenanceScheduleCalculator();
var inSchedule = msc.checkChangeAgainstSchedules(current);
current.outside_maintenance_schedule = !inSchedule;
