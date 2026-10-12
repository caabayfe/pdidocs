var thresholdId = event.parm1;
var sourceType = event.parm2;
new SNC.AllTimeThresholdCollector().evaluateAllTimeThreshold(thresholdId);

gs.info("AllTimeThresholdCollector invoked: source type=" + sourceType + " threshold sys_id=" + thresholdId);
