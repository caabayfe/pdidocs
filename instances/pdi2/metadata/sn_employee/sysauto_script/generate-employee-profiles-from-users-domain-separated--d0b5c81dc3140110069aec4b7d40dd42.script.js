var currentDomainId = gs.getSession().getCurrentDomainID();
gs.info(gs.getMessage("[Generate Employee Profiles from Users]: Creating Employee Profile records from Users in domain: {0}", [currentDomainId]));
var count = new sn_employee.ep_generateEmployeeProfileUtil().createEmployeeProfilesFromUsers();
gs.info(gs.getMessage("[Generate Employee Profiles from Users]: Created {0} Employee Profile records in domain: {1}", [count, currentDomainId]));
