(function() {
	var view = g_request.getParameter('sysparm_view');
	if (!gs.nil(view) && view == "manage_security")
		return "";

	if (gs.hasRole('maint'))
		return;

	var sysId = g_request.getParameter('sys_id');
	if (!gs.nil(sysId) && isValidSysHubFlow(sysId)) {
		if(!gs.nil(current) && current.type == 'subflow')
			return g_uri.toString('$flow-designer.do?sysparm_nostack=true#/sub-flow-designer/' + sysId);
		else
			return g_uri.toString('$flow-designer.do?sysparm_nostack=true#/flow-designer/' + sysId);
	}
	return g_uri.toString('$flow-designer.do?sysparm_nostack=true#');
})();

function isValidSysHubFlow(sysId) {
	var sysHubFlowGr = new GlideRecord("sys_hub_flow");
	return sysHubFlowGr.get(sysId);
}
