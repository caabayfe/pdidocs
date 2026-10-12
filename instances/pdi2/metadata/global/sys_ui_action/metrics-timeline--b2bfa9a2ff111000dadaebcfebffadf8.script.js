function showMetricTimeline() {
	var sysId = g_form.getUniqueValue();
	var url = '/show_schedule_page.do?sysparm_nameofstack=MetricsTimeLineBox&sysparm_page_schedule_type=metrics_timeline&sysparm_timeline_id=' + sysId + "&sysparm_timeline_table=" + g_form.getTableName();

	// Prior gel() + GlideBox + manual window-resize reposition replaced with nowapi.g_modal
	nowapi.g_modal.showFrame({
		title : 'Metrics Timeline',
		url : url,
		size : 'xl'
	});
}
