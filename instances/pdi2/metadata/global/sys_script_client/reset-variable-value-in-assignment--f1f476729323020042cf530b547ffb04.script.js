function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var ga = new GlideAjax('LoadVariableAjax');
	ga.addParam('sysparm_name','loadVariableTemplate');
	ga.addParam('jvar_id', newValue);
	ga.addParam('jvar_value', "");
	ga.addParam('jvar_type', g_form.getValue("type"));
	ga.getXML(ajaxResponse);
}
function ajaxResponse(serverResponse) {
	var result = serverResponse.responseXML.getElementsByTagName("result");
	var template = result[0].getAttribute("template");
	$j("#item_variable_editor").html(template);
}
