function redirectToSlaTimeline() {
	location.href = '/$sla_timeline.do?sysparm_task_sys_id=' + g_form.getUniqueValue();
}
