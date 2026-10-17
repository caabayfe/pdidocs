var script = "var sp = new SncIHubSensorProcessor(current);\nsp.process();";
var sched = new SchedulePriorityECCJob("ASYNC: IntegrationHub - Sensors", current, script);
sched.schedule();
