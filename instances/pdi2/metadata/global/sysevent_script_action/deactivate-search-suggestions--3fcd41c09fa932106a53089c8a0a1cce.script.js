var table = event.parm1;
var docId = event.parm2;
gs.info("Processing event to disable Search Suggestions for record: " + table + "." + docId);
new global.AisDisableSearchSignalEvent().disable(docId);
