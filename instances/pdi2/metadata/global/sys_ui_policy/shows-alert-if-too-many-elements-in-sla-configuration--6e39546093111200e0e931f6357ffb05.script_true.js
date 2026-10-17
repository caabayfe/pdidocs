function onCondition() {
	var sysid = gel('sys_uniqueValue').value;
	var ga = new GlideAjax('IsSLAConfigurationOverpopulated');
	ga.addParam('sysparm_name','getErrorMessage');
	ga.addParam('sla_conf_sys_id',sysid);
	ga.getXML(errMsgParse);
	
	function errMsgParse(response) {
	   var err = response.responseXML.documentElement.getAttribute("answer");
		if (0 !== err.length)
		    g_form.addErrorMessage(err);
	}
	
}
