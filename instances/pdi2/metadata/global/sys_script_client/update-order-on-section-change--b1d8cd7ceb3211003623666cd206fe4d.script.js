function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (!g_form.isNewRecord())
		return;
	
	var sectionAjax = new GlideAjax("sc_ic_SectionAJAX");
	sectionAjax.addParam("sysparm_name", "getNextQuestionOrderNumber");
	sectionAjax.addParam("sysparm_sc_ic_section", g_form.getValue("sc_ic_section"));
	sectionAjax.getXMLWait();
	
	g_form.setValue("order", sectionAjax.getAnswer());
}
