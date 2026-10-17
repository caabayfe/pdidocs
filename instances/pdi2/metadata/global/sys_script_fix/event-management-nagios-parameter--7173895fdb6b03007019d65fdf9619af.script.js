var gr = new GlideRecord("em_connector_definition");
gr.addQuery("name", "NagiosXI");
gr.query();
if (gr.next()){
    
    var conDef = gr.getValue("sys_id");
    
    var grInst = new GlideRecord("em_connector_instance");
    grInst.addQuery("connector_definition", conDef);
    grInst.query();
    while (grInst.next()){
        var grVal = new GlideRecord("em_connector_instance_value");
        grVal.addQuery("connector_instance", grInst.getValue("sys_id"));
        grVal.addQuery("name", "time_zone");
        grVal.query();
        if (!grVal.next()){
            grVal.connector_instance = grInst.sys_id;
            grVal.name = "time_zone";
            grVal.value = "GMT";
            grVal.insert();
        }
    }
}
