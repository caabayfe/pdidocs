var scheduledTaskId = event.parm1;
var statusPayloadString = event.parm2;

var statusPayload = JSON.parse(statusPayloadString);
var status = statusPayload.status;
var progress = statusPayload.progress;
gs.log("Calling ProminAgentActivityApiEventHandler for " + event.getUniqueValue());
SNC.ProcessOptimization.handleAgentActivityApiEvent(scheduledTaskId, status, progress);
gs.log("Finished ProminAgentActivityApiEventHandler for " + event.getUniqueValue());
