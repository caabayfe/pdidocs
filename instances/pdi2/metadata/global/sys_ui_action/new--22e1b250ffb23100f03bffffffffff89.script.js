function onClickWf(dis) {
	var urlParams = new URLSearchParams(window.location.search);
	urlParams.set('sysparm_view', 'new_workflow');
	urlParams.set('sysparm_view_forced', 'true');
	urlParams.set('sys_id', '-1');
	
	var path = "wf_workflow_version.do?";
	g_navigation.open(path + urlParams);
}
