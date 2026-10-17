var script = "var sp = new SncRBSensorProcessor(current);\nsp.process();";
var sched = new SchedulePriorityECCJob("ASYNC: Automation - Sensors", current, script);
sched.schedule();
