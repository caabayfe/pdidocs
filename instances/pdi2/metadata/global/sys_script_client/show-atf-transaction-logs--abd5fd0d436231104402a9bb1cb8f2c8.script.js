function onLoad() {

	var gr = new GlideRecord("sys_atf_transaction_log");
	gr.addQuery("step_result", g_form.getUniqueValue());
	gr.query(function(resultGR) {
		if (resultGR.hasNext())
			g_form.hideRelatedList("syslog_transaction");
		else
			g_form.hideRelatedList("sys_atf_transaction_log");
	});

}
