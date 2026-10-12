//Please note, when changing the interval of this job, the property 'sm.flapper.strategy.job_interval_in_hours' (default 24) should also be updated
var flapperMechanismEnabled = JSUtil.toBoolean(gs.getProperty("sm.flapper.detection_enabled", "true"));
if (flapperMechanismEnabled) {
	var script = new SNC.FlapperStrategiesCenterWrapper();
	script.runStrategies();
	script.fadeOutRecords();
}
