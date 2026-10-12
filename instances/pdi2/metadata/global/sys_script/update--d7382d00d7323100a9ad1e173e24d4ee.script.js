function onAfter(current, previous) {
	//This function will be automatically called when this rule is processed.
	var geo = new GlideRecord("sys_user_geo_location");
	geo.addQuery("address", current.address);
	geo.addQuery("sys_user", current.sys_user);
	geo.addQuery("sys_id", "!=", current.sys_id);
	geo.query();
	if (!geo.next())
		return;
	
	// we already had an entry so update it
	geo.setForceUpdate(true);
	geo.update();
	current.deleteRecord();
}
