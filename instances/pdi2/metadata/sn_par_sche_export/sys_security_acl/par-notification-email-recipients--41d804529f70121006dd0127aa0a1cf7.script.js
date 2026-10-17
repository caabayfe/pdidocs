answer = false;
var parNotifEmailGR = new GlideRecord("par_notification_email");
if (parNotifEmailGR.get(current.par_notification_email))
	answer = parNotifEmailGR.canDelete();
