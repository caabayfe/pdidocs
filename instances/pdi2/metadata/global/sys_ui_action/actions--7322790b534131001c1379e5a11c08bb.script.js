function getResponseFromUrl(response) {
	var answer = response.responseXML.documentElement.getAttribute("answer");
	CustomEvent.fireAll('sa.alertSelectedInAlertPanel',answer);
}

function callAlertActions(){
	var rowSysId= current.sys_id;
	if (rowSysId) {
		var ga = new GlideAjax('ParseURL');
		ga.addParam('sysparm_name','parseURL');
		ga.addParam('rowId',rowSysId);
		
		ga.getXML(getResponseFromUrl);
	}
}
callAlertActions();
