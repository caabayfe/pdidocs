function showDiscoveryLog(){
	var ga = new GlideAjax('ParseURL');
	ga.addParam('sysparm_name','parseURL');
	ga.addParam('table', 'cmdb_ci');
	ga.addParam('rowId',rowSysId);
	console.log('sys_id - '+rowSysId);
	ga.getXML(rowParse);
	
	function rowParse(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		CustomEvent.fireAll('sa.showDiscoveryLogForCi',answer);
	}
	
	//var gr = new GlideRecord('em_alert');
	//gr.addQuery('sys_id', '=', rowSysId);
	//gr.query(alert_cmdb_ci);
	//console.log('sys_id - '+rowSysId);
	//function getCiId(rec){
		//	if(rec.next()){
			//		CustomEvent.fireTop('sw.showDiscoveryLogForCi',rec.cmdb_ci);
			//	}
			//}
		}
		
