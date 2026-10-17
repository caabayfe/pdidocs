function openHealthCheckTool() {	
	var sys_flow_context_id = g_form.getUniqueValue();
	var gr = new GlideRecord('sys_flow_context');
	gr.addQuery('sys_id', sys_flow_context_id);
	gr.query();
	if(gr.next())
		var flow_sys_id = gr.getValue('flow');
	window.open('/flow_health_check.do?sysparm_sys_id='+flow_sys_id,"_blank");
}
