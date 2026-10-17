function onLoad() {
	if (!g_form.isNewRecord())
		return;
	
	var taskDefnStagingAjax = new GlideAjax("sc_ic_TaskDefnStagingAJAX");
	taskDefnStagingAjax.addParam("sysparm_name", "getNextOrderNumber");
	taskDefnStagingAjax.addParam("sysparm_sc_ic_item_staging", g_form.getValue("sc_ic_item_staging"));
	taskDefnStagingAjax.getXMLWait();
	
	g_form.setValue("order", taskDefnStagingAjax.getAnswer());
}
