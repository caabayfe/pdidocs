function onBefore(current, previous) {
	
	if ((previous.filter!=current.filter) || (previous.sys_domain!=current.sys_domain)) {
		var im = new SNC.ImpactManager();
		im.triggerImpact(current.sys_id);
	}
}
