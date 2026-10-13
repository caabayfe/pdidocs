function onAfter(current, previous) {
	var im = new SNC.ImpactManager();
	im.addCiToGroup(current.parent_group, current.sys_id);
}
