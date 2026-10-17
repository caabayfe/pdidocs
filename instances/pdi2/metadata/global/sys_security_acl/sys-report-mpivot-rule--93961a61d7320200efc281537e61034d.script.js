var answer = false;
var gr = new GlideRecord('sys_report');
if (current.report_id)
	if (gr.get(current.report_id))
		answer = gr.canWrite();
