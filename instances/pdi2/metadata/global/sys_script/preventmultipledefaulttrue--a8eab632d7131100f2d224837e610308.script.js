if (current.getValue('default') == true) {
	var gr = new GlideRecord('sc_catalog_view_mtom');
	gr.addQuery('sc_catalog', current.sc_catalog + '');
	gr.addQuery('sys_portal_page', 'NOT IN', current.sys_portal_page  + '');
	gr.addQuery('default', true);
	gr.query();
	
	while (gr.next()) {
		gr.setValue('default', false);
		gr.update();
	}
}
