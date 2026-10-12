function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '' || newValue == "false") {
      return;
   }

    var req = new GlideAjax("DefaultGraphChecker");
	req.addParam("sysparm_name", "canSetDefault");
	req.addParam("sysparm_sysId", g_form.getValue("sys_id"));
	req.addParam("sysparm_scope", g_form.getValue("sys_scope"));
	req.getXML(handleDefaultGraphResponse);

	function handleDefaultGraphResponse(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		if(answer == "true") {
			g_form.setValue("default", false);
			g_form.showFieldMsg("default", "Cannot set to default, as another default graph exists in the same scope", "error");
		}
	}
}
