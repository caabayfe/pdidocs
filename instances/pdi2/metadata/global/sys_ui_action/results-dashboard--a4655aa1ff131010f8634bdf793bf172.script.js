function redirectToResultsDashboard() {
	var resultId = rowSysId ? rowSysId : gel('sys_uniqueValue').value;
	var openInPolaris = 
		(top.NOW.isPolarisEnabled == 'true' || top.NOW.isPolarisWrapper == 'true' || 
		 top.NOW.isPolarisEnabled == true || top.NOW.isPolarisWrapper == true) && 
		 (top.location.href.indexOf('now/polaris/ui') > -1 || top.location.href.indexOf('now/nav/ui') > -1);
	if (!openInPolaris)  { 
		var url = new GlideURL('$scan_result.do');
		url.addParam('result_id', resultId);

		var mainFrame = getMainWindow();
		if (mainFrame) {
			mainFrame.location = url.getURL();
		} else {
			top.location = url.getURL();
		}
	} else { 
		top.location.href = top.location.href.substr(0, top.location.href.lastIndexOf('/') + 1) + encodeURIComponent('$scan_result.do?result_id=' + resultId);
	}
}
