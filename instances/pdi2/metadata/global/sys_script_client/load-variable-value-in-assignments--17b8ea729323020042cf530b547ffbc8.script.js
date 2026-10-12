function onLoad() {
   //Type appropriate comment here, and begin script below
   var ga = new GlideAjax('LoadVariableAjax');
	ga.addParam('sysparm_name','loadVariableTemplate');
	ga.addParam('jvar_id', g_form.getValue("item_variable"));
	ga.addParam('jvar_value', g_form.getValue("value"));
	ga.addParam('jvar_type', g_form.getValue("type"));
	ga.getXML(ajaxResponse);
}
function ajaxResponse(serverResponse) {
	var result = serverResponse.responseXML.getElementsByTagName("result");
	var template = result[0].getAttribute("template");
	$j("#item_variable_editor").html(template);
}
