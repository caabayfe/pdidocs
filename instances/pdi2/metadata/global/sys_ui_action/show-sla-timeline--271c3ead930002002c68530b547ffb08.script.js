function showSLATimeline() {
	var url = new GlideURL('sla_timeline.do');
	if (typeof rowSysId == 'undefined')
		 sysId = gel('sys_uniqueValue').value;
	   else
		 sysId = rowSysId;
	var gr = new GlideRecord("task_sla");
	gr.get(sysId);
	url.addParam('sysparm_timeline_sla', gr.sla);
	url.addParam('sysparm_timeline_task',  gr.task);

	var slaTimeline = new GlideOverlay({
		id : "sla_timeline",
		title : getMessage("SLA Timeline"),
		iframe : url.getURL(),
		closeOnEscape : true,
		showClose : true,
		height : "90%",
		width : "90%"
	});

	slaTimeline.center();
	slaTimeline.render();
}
