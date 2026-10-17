function onAsync(current) {
   //This function will be automatically called when this rule is processed.
   var deviceId = createDevice(current.sys_push_application_id, current.sys_user_id, current.sys_push_application_id.display_name);
   createMessageSubscriptions(deviceId, current.sys_push_application_id, current.sys_push_application_id.parent_app, current.sys_user_id);
}

function createDevice(pushApplication, userId, name) {
	var actualAppId = pushApplication;
	if (!GlideStringUtil.nil(pushApplication.parent_app))
		actualAppId = pushApplication.parent_app;
	
	var grDevice = new GlideRecord("cmn_notif_device");
    grDevice.addQuery("push_app",actualAppId);
	grDevice.addQuery("user",userId);
	grDevice.query();
	if (grDevice.next())
		return grDevice.getUniqueValue();
	
	grDevice.push_app = actualAppId;
	grDevice.user = userId;
	grDevice.name = name;
	if (!GlideStringUtil.nil(pushApplication.parent_app.display_name))
		grDevice.name = pushApplication.parent_app.display_name;
	grDevice.type = "Push";
	return grDevice.insert();
}

function createMessageSubscriptions(deviceId, appId, parentAppId, userId) {
    var grDefaultRegistration = new GlideRecord("sys_push_notif_default_reg");
	grDefaultRegistration.addQuery("sys_event_email_action_id.active", "true");
	var orQuery = grDefaultRegistration.addQuery("sys_push_application_id", appId);
	if (!GlideStringUtil.nil(parentAppId)) 
		orQuery.addOrCondition("sys_push_application_id", parentAppId);
	
	grDefaultRegistration.query();
	while (grDefaultRegistration.next()) {	
		var defaultNotification = grDefaultRegistration.getValue("sys_event_email_action_id");
		createMessageSub(defaultNotification, deviceId, userId);
	}
		
}

function createMessageSub(notifId, deviceId, userId) {
	var grNotif = new GlideRecord("cmn_notif_message");
	grNotif.addQuery("notification",notifId);
	grNotif.addQuery("device",deviceId);
	grNotif.query();
	if (grNotif.next())
		return;
	
	grNotif.notification = notifId;
	grNotif.device = deviceId;
	grNotif.user = userId;
	grNotif.insert();
}
