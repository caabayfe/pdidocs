if (!pm.isZboot()) {
	var pluginGR = new GlideRecord("sys_plugins");
	pluginGR.addQuery("source", "com.glide.automated_testing_framework.wbe");
	pluginGR.query();
	if (pluginGR.next()) {
		pluginGR.deleteRecord();
		gs.info("Removed sys_plugins record with ID: com.glide.automated_testing_framework.wbe as it was renamed to com.glide.automated_testing_impl.wce");
	} else
		gs.info("Did not find a sys_plugins record with ID: com.glide.automated_testing_framework.wbe");
}
