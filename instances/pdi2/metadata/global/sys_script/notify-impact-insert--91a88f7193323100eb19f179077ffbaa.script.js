function onAfter(current, previous) {
	var im = new SNC.ImpactManager();
	im.addCiToGroup(current.service_group, current.service);
}
