function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(!newValue) {
		g_form.setMandatory('label', false);
	}
	
	var sectionAttributeGR = new GlideRecord('sys_sg_section_attribute');
	sectionAttributeGR.addQuery('section', newValue);
	sectionAttributeGR.addQuery('name', 'SectionType');
	sectionAttributeGR.addQuery('value', 'barcode');
	sectionAttributeGR.query();
	if(sectionAttributeGR.next()) {
		g_form.setMandatory('label', true);
	}
}
