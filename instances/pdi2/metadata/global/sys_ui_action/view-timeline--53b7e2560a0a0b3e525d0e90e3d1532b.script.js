function viewTimeline() {
	// Push only the client options into URI parameters
	var sysId = typeof rowSysId == 'undefined' ? gel('sys_uniqueValue').value : rowSysId;
	
	var url = new GlideURL('show_schedule_page.do');
    url.addParam('sysparm_page_schedule_type', 'timeline_page');
    url.addParam('sysparm_timeline_page_id', sysId);
	g_navigation.open(url.getURL(), "_blank");
	return false;
}
