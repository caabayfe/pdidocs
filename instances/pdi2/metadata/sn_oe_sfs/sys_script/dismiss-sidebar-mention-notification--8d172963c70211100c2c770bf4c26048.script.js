(function executeRule(current, previous /*null when async*/) {
	var recipientId = current.collab_user.user;
  var messageId = current.message.sys_id;
  var notificationGR = new GlideRecord("ui_notification_inbox");			
	notificationGR.addQuery("recipient", recipientId);
	notificationGR.addQuery("status", "!=", "deleted");
	notificationGR.addQuery("target", messageId);
	notificationGR.addQuery("target_table", "sys_cs_collab_message");
	notificationGR.query();
	notificationGR.setValue("status", "deleted");
	notificationGR.updateMultiple();

})(current, previous);
