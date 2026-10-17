
function updateCIReference() {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'itam_ci_usage');
	gr.addQuery('element', 'resource');
	gr.addQuery('internal_type', 'reference');
	gr.addQuery('reference', 'cmdb_ci_hardware');
	gr.query();
	if (gr.next()) {
		gr.setValue('reference', 'cmdb_ci');
		gr.update();
	}
}
updateCIReference();
