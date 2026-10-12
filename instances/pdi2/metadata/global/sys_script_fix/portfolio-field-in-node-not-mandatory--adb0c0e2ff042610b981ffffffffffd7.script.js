var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'spm_taxonomy_node');
gr.addQuery('element', 'spm_service_portfolio');
gr.query();
if (gr.next()) {
	if (gr.getValue('mandatory') == '1') {
		gr.setValue('mandatory', '0');
		gr.update();
		gs.info('[SPM]: Changed spm_service_portfolio field to not be mandatory on spm_taxonomy_node table');
	}
}
