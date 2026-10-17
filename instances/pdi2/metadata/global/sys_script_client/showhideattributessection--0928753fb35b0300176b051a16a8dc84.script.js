function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	// Make GR call to see if there are any attributes
	var attrRecord = new GlideRecord("connection_attributes");
	attrRecord.addQuery("model",newValue);
	attrRecord.query();
	if (attrRecord.hasNext())
		g_form.setSectionDisplay('attributes', true);
	else 
		g_form.setSectionDisplay('attributes', false);		
}
