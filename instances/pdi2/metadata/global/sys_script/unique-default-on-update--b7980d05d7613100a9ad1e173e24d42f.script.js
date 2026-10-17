function onAfter(current, previous) {
	//This function will be automatically called when this rule is processed.
	var portal = new GlideRecord("sp_portal");
	portal.addQuery("default", "true");
	portal.addQuery("sys_id", "!=", current.sys_id);
	portal.query();
	while (portal.next()) {
		portal.setValue("default", false);
		portal.update();
	}
}
