function onCondition() {
	var sysid = gel('sys_uniqueValue').value;
	var ga = new GlideAjax('IsQBSOverpopulated');
	ga.addParam('sysparm_name','getErrorMessage');
	ga.addParam('qbs_sys_id',sysid);
	ga.getXML(errMsgParse);
	
	function errMsgParse(response) {
		//The JSON message is created in IsQBSOverpopulated script include
		//The JSON includes {message: err, tooltip: tooltip};
		var errJson = response.responseXML.documentElement.getAttribute("answer");
		var err = JSON.parse(errJson);
		if (err.message) {
			g_form.addInfoMessage(err.message);
		}		    
	}
	
}
