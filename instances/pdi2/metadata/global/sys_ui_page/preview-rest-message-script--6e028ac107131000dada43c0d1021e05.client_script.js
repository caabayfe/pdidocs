var gr = new GlideRecord('sys_rest_message_fn');
gr.addQuery('sys_id', '${sysparm_id}');
gr.query();
if (gr.next()) {
    var mgr = new GlideRecord('sys_rest_message');
    mgr.addQuery('sys_id', gr.rest_message);
    mgr.query();
    mgr.next();

	var scope = "";
    if(mgr.sys_scope) {
	  var app = new GlideRecord("sys_app");
  	  app.get(mgr.sys_scope);
	  scope = app.scope;
	}
    
    var scopedMsgName = scope && scope.length > 0 ? scope + "." + mgr.name : mgr.name;

    var sample_script = '\n try { \n var r = new sn_ws.RESTMessageV2(\'' + scopedMsgName + '\', \'' + gr.function_name + '\');\n';

    var pgr = new GlideRecord('sys_rest_message_fn_parameters');
    pgr.addQuery('rest_message_function', gr.sys_id);
    pgr.query();
    while(pgr.next())
        sample_script += ' r.' + ('' + pgr.type == 'string' ? 'setStringParameterNoEscape' : 'setStringParameter') + 
                         '(\'' + pgr.name + '\', \'' + pgr.value + '\');\n';
    sample_script += "\n//override authentication profile \n//authentication type ='basic'/ 'oauth2'\n//r.setAuthenticationProfile(authentication type, profile name);\n\n";
    sample_script += "//set a MID server name if one wants to run the message on MID\n//r.setMIDServer('MY_MID_SERVER');\n\n";
    sample_script += "//if the message is configured to communicate through ECC queue, either\n//by setting a MID server or calling executeAsync, one needs to set skip_sensor\n";
    sample_script += "//to true. Otherwise, one may get an intermittent error that the response body is null\n//r.setEccParameter('skip_sensor', true);\n\n";
    sample_script += ' var response = r.execute();\n var responseBody = response.getBody();\n var httpStatus = response.getStatusCode();\n}\ncatch(ex) {\n var message = ex.message;\n}\n';

    var ifr = gel('ep');
    ifr.innerHTML = sample_script;
}
