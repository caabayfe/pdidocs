(function executeRule(current, previous) {
	try {
		var im = new SNC.ImpactManager();
		im.triggerImpactForNewService(current.sys_id, current.sys_class_name);
	} catch (ex) {
		gs.error("Failed to call triggerImpactForNewService: " + ex.message);
	}
})(current, previous);
