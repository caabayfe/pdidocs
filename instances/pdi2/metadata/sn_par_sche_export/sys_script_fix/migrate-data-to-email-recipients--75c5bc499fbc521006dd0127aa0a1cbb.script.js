var notifEmailGR = new GlideRecord("par_notification_email");
var notifEmailRecipientsGR = new GlideRecord("par_notification_email_recipients");
if (notifEmailGR.isValid()) {
	notifEmailGR.query();
	while (notifEmailGR.next()) {
		notifEmailRecipientsGR.initialize();
		notifEmailRecipientsGR.setValue("users", notifEmailGR.getValue("users"));
		notifEmailRecipientsGR.setValue("groups", notifEmailGR.getValue("groups"));
		notifEmailRecipientsGR.setValue("par_notification_email", notifEmailGR.sys_id);
		notifEmailRecipientsGR.insert();
	}
}
