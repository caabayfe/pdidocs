// Show the workflow version in a new window
function saveAndShowWorkflowVersion(dis) {

	saveVersion();

	showInDiagrammer();
	
	
	function saveVersion() {
		var SYSVERB_UPDATE_GLOBAL = "42da42d00a0a0b340066377beb6dd099";
	
		dis.setAttribute("gsft_id", SYSVERB_UPDATE_GLOBAL);
		return gsftSubmit(dis);
	}
	
	function showInDiagrammer() {
		
	    var w = getHighestParentWith("popupOpenFocus");
		
		if (top.location.href.indexOf('workflow_ide.do') != -1)
			return;

		
		var id = g_form.getUniqueValue();
		var url = new GlideURL('workflow_ide.do');
		url.addParam('sysparm_sys_id', id);
		
		w.popupOpenFocus(url.getURL(), 'show_workflow_version', 950, 700, '', false, false);
	}

	function getHighestParentWith(prop) {
		var topWin = window.self;
		try {
			while (topWin !== topWin.parent && topWin.parent[prop]) {
				topWin = topWin.parent;
			}
		} catch(e) {}

		return topWin;
	}

}
