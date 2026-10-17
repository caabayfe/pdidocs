var source = event.parm1;
var runDate = event.parm2;
new SNC.CDCDataCollectorJob().runDeltaMining(source, runDate);
gs.info("Invoked delta mining for source id " + source + " with run date " + runDate);
