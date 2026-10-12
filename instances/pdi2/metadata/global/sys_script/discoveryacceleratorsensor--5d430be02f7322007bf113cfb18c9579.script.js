var script = "var job = new DiscoveryAcceleratorSensorJob();\njob.process();";
var sched = new SchedulePriorityECCJob("ASYNC: DiscoveryAccelerator Sensor", current, script);
sched.schedule();
