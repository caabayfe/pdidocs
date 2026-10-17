//this is deactivated as there is another ui action which serves as both form link and context menu
function showSLATimeline() {
	var url = new GlideURL('sla_timeline.do');
	url.addParam('sysparm_nostack',true);
	url.addParam('sysparm_timeline_sla', g_form.getValue('sla'));
	url.addParam('sysparm_timeline_task',  g_form.getValue('task'));

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
