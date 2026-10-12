function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var ga = new GlideAjax('LoadVariableAjax');
	ga.addParam('sysparm_name','loadVariableTemplate');
	ga.addParam('jvar_id', g_form.getValue("item_variable"));
	ga.addParam('jvar_value', "");
	ga.addParam('jvar_type', newValue);
	ga.getXML(ajaxResponse);
}
function ajaxResponse(serverResponse) {
	var result = serverResponse.responseXML.getElementsByTagName("result");
	var template = result[0].getAttribute("template");
	$j("#item_variable_editor").html(template);
}
