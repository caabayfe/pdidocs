var gr = new GlideRecord("sys_soap_message_function");
gr.addQuery("sys_id", "${sysparm_id}");
gr.query();
if (gr.next()) {
	var mgr = new GlideRecord("sys_soap_message");
	mgr.addQuery("sys_id", gr.soap_message);
	mgr.query();
	mgr.next();

	var scope = "";
    if(mgr.sys_scope) {
	  var app = new GlideRecord("sys_app");
  	  app.get(mgr.sys_scope);
	  scope = app.scope;
	}
    
    var scopedMsgName = scope && scope.length > 0 ? scope + "." + mgr.name : mgr.name;

	var sample_script = "\ntry { \n var s = new sn_ws.SOAPMessageV2('" + scopedMsgName + "', '" + gr.function_name + "');\n";
    sample_script += "\n//override authentication profile \n//authentication type ='basic'\n//s.setAuthenticationProfile(authentication type,profile sysid);\n\n";
    sample_script += "//set a MID server name if one wants to run the message on MID\n//s.setMIDServer('MY_MID_SERVER');\n\n";
    sample_script += "//if the message is configured to communicate through ECC queue, either\n//by setting a MID server or calling executeAsync, one needs to set skip_sensor\n";
    sample_script += "//to true. Otherwise, one may get an intermittent error that the response body is null\n//s.setEccParameter('skip_sensor', true);\n\n";
    
	var pgr = new GlideRecord("sys_soap_message_parameters");
	pgr.addQuery("soap_function", gr.sys_id);
	pgr.query();
	while(pgr.next()) {
		if (pgr.type == "string")
			sample_script += " s.setStringParameterNoEscape('" + pgr.name + "', '" + pgr.value + "');\n";
		else
			sample_script += " s.setStringParameter('" + pgr.name + "', '" + pgr.value + "');\n";
		
	}
	
	sample_script += " var response = s.execute();\n var responseBody = response.getBody(); \n var status = response.getStatusCode();\n}\ncatch(ex) { \n var message = ex.message;\n}";
	
	var ifr = gel("ep");
	ifr.innerHTML = sample_script;
}
