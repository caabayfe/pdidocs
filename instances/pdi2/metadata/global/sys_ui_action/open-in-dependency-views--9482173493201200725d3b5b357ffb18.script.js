function openDependencyView(){
	if (g_sysId) {
		var ga = new GlideAjax('ParseURL');
		ga.addParam('sysparm_name','parseURL');
		ga.addParam('rowId',g_sysId);
		function getResponseFromUrl(response) {
			var ciId = response.responseXML.documentElement.getAttribute("answer");
			var url = '$ngbsm.do?id=' + ciId;
			var newWin = window.open(url, '_blank');
			if(!newWin || newWin.closed || (typeof newWin.closed === "undefined")) 
				CustomEvent.fireAll("snc.reportInfo" , getMessage("Turn off your pop-up blocker!"));
		};
		ga.getXML(getResponseFromUrl);
	}
	
}
