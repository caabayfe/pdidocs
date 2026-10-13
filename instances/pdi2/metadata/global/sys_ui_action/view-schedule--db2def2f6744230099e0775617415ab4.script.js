function viewRotationSchedule() {
	var sysId = "",
	groupId = "";
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;
	var gr = new GlideRecord("v_rotation");
	if (gr.get(sysId)) {
		groupId = gr.group + "";
	}
	var url = new GlideURL('$oc.do');
	url.addParam('sysparm_group_id', groupId);
	g_navigation.open(url.getURL(), "_blank");
	return false;
}
