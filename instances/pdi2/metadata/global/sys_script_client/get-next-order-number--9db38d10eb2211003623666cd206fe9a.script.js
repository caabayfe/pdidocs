function onLoad() {
	if (!g_form.isNewRecord())
		return;
	
	var aprvlDefnStagingAjax = new GlideAjax("sc_ic_ApprovalDefnStagingAJAX");
	aprvlDefnStagingAjax.addParam("sysparm_name", "getNextOrderNumber");
	aprvlDefnStagingAjax.addParam("sysparm_sc_ic_item_staging", g_form.getValue("sc_ic_item_staging"));
	aprvlDefnStagingAjax.getXMLWait();
	
	g_form.setValue("order", aprvlDefnStagingAjax.getAnswer());
}
