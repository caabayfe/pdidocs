(function() {
	var gr = new GlideRecord("sys_dictionary");
	if (!gr.isValid())
		return;
	gr.addQuery('name', 'sys_aw_form_header_secondary_values');
	gr.addQuery('element', 'field');
	gr.query();
	if (gr.next()) {
		gs.info("add allow_reference=true attribute to sys_aw_form_header_secondary_values.field");
		// currently the field has no attributes, so we can do set instead of append
		gr.setValue('attributes', 'allow_references=true');
		gr.update();
	}
})();
        
