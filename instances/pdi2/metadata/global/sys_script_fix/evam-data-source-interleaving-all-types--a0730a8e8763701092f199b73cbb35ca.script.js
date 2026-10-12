if (!pm.isZboot()) {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery("name", "sys_ux_composite_datasource");
	gr.addQuery("element", "sort_by");
	gr.addNotNullQuery("attributes");
	gr.query();
	if (gr.next()) {
		gr.attributes = "";
		gr.update();
		gs.print("Changed sys_ux_composite_data.sort_by Dictionary entry to support all field types");
	}
}
