function updateAuditFlag() {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'cmdb_software_product_model');
	gr.addQuery('internal_type', 'collection');
	gr.query();
	if (gr.next()) {
		if (gr.getValue('audit') === '0') {
			gr.setValue('audit', '1');
			gr.update();
		}
	}
}

updateAuditFlag();
