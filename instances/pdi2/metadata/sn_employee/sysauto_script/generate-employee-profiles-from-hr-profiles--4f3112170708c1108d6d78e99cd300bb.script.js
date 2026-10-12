gs.info(gs.getMessage("[Generate Employee Profiles from HR Profiles]: Creating Employee Profile records from HR Profiles"));
var count = new sn_employee.ep_generateEmployeeProfileUtil().createEmployeeProfilesFromHRProfiles();
gs.info(gs.getMessage("[Generate Employee Profiles from HR Profiles]: Created {0} Employee Profile records", [count]));
