function resumeDiscovery(){
	//client script 
	var ga = new GlideAjax('ParseURL');
	ga.addParam('sysparm_name','parseURL');
	ga.addParam('table', 'cmdb_ci');
	ga.addParam('rowId',rowSysId);
	ga.getXML(parse_url);
	
	function parse_url(response) {
		var ciId = response.responseXML.documentElement.getAttribute("answer");
		
		CustomEvent.fireAll('sa.resumeDiscoveryForCi',ciId);
	}
	
}
		
