function onLoad() {
	if (!g_form.isNewRecord())
		return;
	
	var sectionAjax = new GlideAjax("sc_ic_SectionAJAX");
	sectionAjax.addParam("sysparm_name", "getNextPosition");
	sectionAjax.addParam("sysparm_sc_ic_item_staging", g_form.getValue("sc_ic_item_staging"));
	sectionAjax.getXMLWait();

	g_form.setValue("index", sectionAjax.getAnswer());
}
