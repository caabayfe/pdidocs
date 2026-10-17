function indexSingleTable() {
	var gm = new GlideModal('ais_index_single_table');
    var sysId = g_form.getUniqueValue();
	var datasource = g_form.getValue('source');
    gm.setTitle('Generate Text Index - Single Table');
    gm.setPreference('sys_id', sysId);
	gm.setPreference('datasource', datasource);
    gm.render();
}
