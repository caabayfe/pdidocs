showFiredEvents();

function showFiredEvents() {
	var url = 'sysevent_list.do?sysparm_query=GOTOname%3Dpa.job.indicator.notification%5Einstance%3D' + current.sys_id;
	action.setRedirectURL(url);
}
