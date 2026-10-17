(function executeRule(current, previous /*null when async*/) {
	var msgArray = new Array();
	var blockedOIDArr = new Array();
	var netSNMPOID = {oid: "1.3.6.1.4.1.8072.3.2.", kbLink: "<a class=\"linked\" target=\"_blank\" href='https://hi.service-now.com/nav_to.do?uri=%2Fkb_view.do%3Fsysparm_article%3DKB0751287%26sysparm_stack%3D%26sysparm_view%3D'>KB0751287</a>"};
	var windowsOID = {oid: "1.3.6.1.4.1.311.1.1.3.", kbLink: "<a class=\"linked\" target=\"_blank\" href='https://hi.service-now.com/nav_to.do?uri=%2Fkb_view.do%3Fsysparm_article%3DKB0827329%26sysparm_stack%3D%26sysparm_view%3D'>KB0827329</a>"};
	blockedOIDArr.push(netSNMPOID);
	blockedOIDArr.push(windowsOID);
	
	var oidData = (function() {
		for (var i = 0; i < blockedOIDArr.length; i++) 
			if (current.oid.startsWith(blockedOIDArr[i].oid))
				return blockedOIDArr[i];
	})();
	
	msgArray.push('"' + oidData.oid + '"');
	msgArray.push(oidData.kbLink);
	var message = gs.getMessage("SNMP OIDs starting with {0} are prevented from inserting.\nFor more information please see {1}.", msgArray);
	gs.addInfoMessage(message);
	current.setAbortAction(true);
})(current, previous);
