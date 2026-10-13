var gr = new GlideRecord("em_connector_definition");
gr.addQuery("name", "SCOM");
gr.query();
if (gr.next()){
    var scomDef = gr.getValue("sys_id");
    var grInst = new GlideRecord("em_connector_instance");
    grInst.addQuery("connector_definition", scomDef);
    grInst.addQuery("kpi", 'true');
    grInst.query();
    while (grInst.next()){
        grInst.kpi_win_auth = 'true';
		grInst.kpi_host = grInst.host;
        grInst.update();
    }
}
