//Note: If this is being updated, there probably needs a change in java DiscoveryUtils.rescheduleSensorJob
var script = "var job = new DiscoverySensorJob();\njob.process();";
var jobName = DiscoverySensorJob.buildJobNameFromEcc(current);
var sched = new SchedulePriorityECCJob(jobName, current, script);
sched.schedule();
