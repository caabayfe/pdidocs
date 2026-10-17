var table = event.parm1;
var param2 = JSON.parse(event.parm2);
var toDate = param2.toDate;
var timeZone = param2.timeZone;
new SNC.CDCDataCollectorJob().transferChanges(table, toDate, timeZone);
gs.info("Invoked transfer changes for table " + table + " to date " + toDate + " with timezone " + timeZone);
