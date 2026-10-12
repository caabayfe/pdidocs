var gr = GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_playbook_activity_renderer");
gr.addQuery("element", "activity_definition");
gr.query();

while(gr.next()) {
	gr.setValue("reference_qual", "javascript:'active=true^activity_type=' + current.type;");
	gr.update();
}
