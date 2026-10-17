gs.info("Running fix script: handleUnknownNodes");
var startTime = new Date();

var unknownHandler = new EvtMgmtLicenseHandleUnknown();
unknownHandler.removeUnknownNodes();

var endTime = new Date();
var diff = endTime.getTime() - startTime.getTime(); 
gs.info("handleUnknownNodes took {0} seconds to run.", diff/1000);
