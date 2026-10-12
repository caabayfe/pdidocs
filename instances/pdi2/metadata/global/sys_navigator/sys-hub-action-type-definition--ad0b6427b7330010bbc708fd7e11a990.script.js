(function() {
	var view = g_request.getParameter('sysparm_view');
	if (!gs.nil(view) && view == "manage_security")
		return "";

    if (gs.hasRole('maint'))
		return;

  	var sysId = g_request.getParameter('sys_id');
	if (!gs.nil(sysId) && isValidSysHubAction(sysId))
		return g_uri.toString('$flow-designer.do?sysparm_nostack=true#/action-designer/' + sysId);

	return g_uri.toString('$flow-designer.do?sysparm_nostack=true#');
})();

function isValidSysHubAction(sysId) {
	var sysHubActionGr = new GlideRecord("sys_hub_action_type_definition");
	return sysHubActionGr.get(sysId);
}
