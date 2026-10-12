function SlaTimelineDebugger() {
	var sysId = gel('sys_uniqueValue').value;
	var url = new GlideURL('sla_timeline.do');
	url.addParam('sysparm_nostack',true);
	url.addParam('sysparm_timeline_sla',sysId);

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
