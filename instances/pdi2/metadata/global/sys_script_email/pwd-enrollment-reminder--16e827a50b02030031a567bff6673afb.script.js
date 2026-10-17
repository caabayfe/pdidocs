(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	email.setFrom(event.parm1);
	email.setReplyTo(event.parm1);
	
	var users = event.parm2.split(",");
 
   //get user records
   var user = new GlideRecord("sys_user");
   user.addQuery("sys_id", users);
   user.query();
   while (user.next()) {
	   email.addAddress("bcc", user.email, user.getDisplayValue());
   }
	var enrollmentURL = gs.getProperty('glide.servlet.uri') + "$pwd_enrollment_form_container.do";
	template.print("Click <a href='" + enrollmentURL + "'>here </a> to enroll in the Password Reset program.");


})(current, template, email, email_action, event);
