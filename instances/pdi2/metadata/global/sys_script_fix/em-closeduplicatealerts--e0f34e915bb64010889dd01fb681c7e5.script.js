gs.info("Running fix script: closeDuplicateAlerts");
var startTime = new Date();

var closeDups = new EvtMgmtCloseDuplicateAlerts();
closeDups.closeDuplicateAlerts();

var endTime = new Date();
var diff = endTime.getTime() - startTime.getTime(); 
gs.info("closeDuplicateAlerts took {0} seconds to run.", diff/1000);
