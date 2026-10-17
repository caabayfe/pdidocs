/*
* Event Management - Alert Management Rules
********************************************
* The 'evt_mgmt.alert_management_scoped_active' property 
* is not provided at all by default (not in 'All Properties' nor in 'EM Properties')
* and is queried (by gs.getProperty()) with default value of 'false' anytime its called.
*
* This is because we'd like it to be 'false' by default for instances that are upgraded
* from releases prior to Rome, in order to prevent conflicts between the Global AMR and scoped AMR.
*
* For instances with clean install of Rome (or ZBOOTed), this script will run (on EM 'plugin.activated' event)
* and will set the property value to true.
* ZBOOTed customers don't have the Global AMR installed, therefore only the scoped AMR will run because
* the property is set to true.
*/
gs.setProperty('evt_mgmt.alert_management_scoped_active', 'true');
