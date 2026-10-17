function migrate() {
	var gm = new GlideModal('ais_migrate_child_table');
	gm.setTitle('Migrate Child Table');
	gm.setPreference('child_table_name', g_form.getValue('table'));
	gm.render();
}
