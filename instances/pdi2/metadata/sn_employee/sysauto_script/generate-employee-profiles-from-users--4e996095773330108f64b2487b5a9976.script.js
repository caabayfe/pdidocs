gs.info(gs.getMessage("[Generate Employee Profiles from Users]: Creating Employee Profile records from Users"));
var count = new sn_employee.ep_generateEmployeeProfileUtil().createEmployeeProfilesFromUsers();
gs.info(gs.getMessage("[Generate Employee Profiles from Users]: Created {0} Employee Profile records", [count]));
