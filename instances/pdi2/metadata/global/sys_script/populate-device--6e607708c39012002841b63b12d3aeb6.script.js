(function executeRule(current, previous /*null when async*/) {
	if (!current.isNewRecord())
		return;
	
	var gr = new GlideRecord("cmn_notif_device");
	gr.addQuery("primary_email", true);
	gr.addQuery("user", current.user);
	gr.query();
	if (gr.next())
		current.devices = gr.sys_id;


})(current, previous);
