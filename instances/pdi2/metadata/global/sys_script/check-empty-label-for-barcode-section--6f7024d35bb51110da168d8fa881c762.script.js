(function executeRule(current, previous /*null when async*/) {
	if(!current.parameter_section) return;
	
	var sectionAttributeGR = new GlideRecord('sys_sg_section_attribute');
	sectionAttributeGR.addQuery('section', current.parameter_section);
	sectionAttributeGR.addQuery('name', 'SectionType');
	sectionAttributeGR.addQuery('value', 'barcode');
	sectionAttributeGR.query();
	if(sectionAttributeGR.next() && !current.label) {
		gs.addErrorMessage(gs.getMessage('Warning: Label Should Not be Empty for Barcode Section'));
	}
})(current, previous);
