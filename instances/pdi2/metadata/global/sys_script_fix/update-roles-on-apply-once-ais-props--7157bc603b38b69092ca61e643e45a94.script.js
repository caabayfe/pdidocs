var gr = new GlideRecord('sys_properties');
var properties = ['glide.ais.enabled', 'glide.ais.initialized', 'glide.ais.global_search.app_installed'];
gr.addQuery('name', 'IN', properties.join(','));
gr.query();

while (gr.next()) {
	var read = gr.getValue('read_roles') || '';
	if (read) 
		read +=",";
	
	read += "ais_admin";
	gr.setValue('read_roles', read);
	gr.setValue('write_roles', 'maint');
	gr.update();
}
