(function executeRule(current, previous /*null when async*/) {

	var pack = new GlideRecord("sys_package");
	if (!pack.get("source", "com.glide.service-portal.service-status"))
		return;
  	var notes = new GlideRecord("sysevent_email_action");
	notes.addQuery("sys_package", pack.getUniqueValue());
	notes.query();
	var device = _getPrimaryEmail();
  	
	while (notes.next()) {
		var msg = new GlideRecord("cmn_notif_message");
		msg.addQuery("user", gs.getUserID());
		msg.addQuery("configuration_item", current.cmdb_ci_service);
		msg.addQuery("device", device);
		msg.addQuery("notification", notes.getUniqueValue());
		msg.query();
		if (msg.hasNext())
			continue;
		msg.initialize();
		msg.user = gs.getUserID();
		msg.configuration_item = current.cmdb_ci_service;
		msg.device = device;
		msg.notification = notes.getUniqueValue();
		msg.insert();
	}
	
	function _getPrimaryEmail() {
		var user_id = gs.getUserID();
		var gr = new GlideRecord('cmn_notif_device');
		gr.addQuery('user', user_id);
		gr.addQuery('primary_email', true);
		gr.setLimit(1);
		gr.query();
		if (gr.next())
		   return gr.getUniqueValue();

		gr.initialize();
		gr.user = user_id;
		gr.name = 'Primary email';
		gr.primary_email = true;
		gr.type = 'Email';
		gr.email_address = gs.getUser().getEmail();
		return gr.insert();
	}

})(current, previous);
