function onLoad() {
    var orderPhoneTask = "0527a85837213000158bbfc8bcbe5d71";
    var deliverToITLabTask = "54b346b337b1300054b6a3549dbe5df6";
    g_form.setReadonly("carrier", true);
    var gr = new GlideRecord("sc_task");
	gr.addQuery("sys_id", g_form.getUniqueValue());
	gr.query();
	if (gr.next()) {
		var id = gr.delivery_task;
		if (id != orderPhoneTask && id != deliverToITLabTask)
			g_form.setReadonly("carrier", false);
	}
}
