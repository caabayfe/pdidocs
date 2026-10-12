function onLoad() { 
    if (g_form.getValue("payload_diff") != "" ) 
       return;
	
	var ga = new GlideAjax("DiffAjax");
    ga.addParam("sysparm_name", "diffUpdateSetPreview");
    ga.addParam("sysparm_sys_id",g_form.getUniqueValue());
    ga.getXMLWait();
    var diff = ga.getAnswer();
    g_form.setValue("payload_diff", diff);
}
   
