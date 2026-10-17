function SlaTimelineDebugger() {
	var sysId = gel('sys_uniqueValue').value;
	var url = new GlideURL('$sla_timeline.do');
	url.addParam('sysparm_contract_sla_id',sysId);
	g_navigation.open(url.getURL());
}
