/* 
This is the script action we use to send out authentication code to both Email and SMS devices.
We don't use platform Notifications any more as it sends code to ALL devices of a user.
But we still keep the Notification as a way to know wether a device is subscribed to Email or SMS verifications.
*/

sendCode();


// DEF0063745 notification_type is not exposed by any API so we have to do GlideRecord insert
// PRB1263734: Set target record to restrict access to this email record
function sendCode() {
	var parms = event.parm1.split(",");
	var notificationType = parms[0];
	var addrs = parms.slice(1);
	var code = event.parm2;
	
	var grEmail = new GlideRecord("sys_email");
	grEmail.recipients = addrs.join(",");
	grEmail.target_table = event.table;
	grEmail.instance = event.instance;
	grEmail.type = "send-ready";
	
	if (notificationType == "SMTP") {
		grEmail.subject = gs.getMessage("Password reset verification code");
		grEmail.body_text = gs.getMessage("Use this verification code to verify your identity: {0}", code);
		grEmail.notification_type = notificationType;
		grEmail.content_type = "text/plain";
		grEmail.insert();
		
	} else if (notificationType == "SMS") {
		grEmail.subject = gs.getMessage("To verify your identity, use this verification code: {0}", code);
		grEmail.notification_type = notificationType;
		grEmail.content_type = "multipart/mixed";
		grEmail.insert();
	}
	
}
