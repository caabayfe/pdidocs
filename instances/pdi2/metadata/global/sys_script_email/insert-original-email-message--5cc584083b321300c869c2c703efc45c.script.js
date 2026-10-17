(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
						/* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
						/* Optional GlideRecord */ event) {
	// This mail script is intended to be used by the response client templates and will only work as expected
	// if called from a template with a content type of HTML. current represents the original sys_email record.
	var user = new GlideRecord('sys_user');
	var uname = current.user.toString();

	if (current.user_id && user.get(current.user_id))
		uname = getFormatedNameAndEmailFromUser(user);
	else if (current.type != 'received') {
		//Try and get the user that created the email
		var createByName = current.sys_created_by;
		if (user.get('user_name', createByName))
			uname = getFormatedNameAndEmailFromUser(user);
		else if (!current.user) { 
			//otherwise use the info from the SMTP account
			var emailAccount = new GlideRecord("sys_email_account");
			emailAccount.addActiveQuery();
			emailAccount.addQuery("type", "smtp");
			emailAccount.query();
			if (emailAccount.next()) {
				var userLabel = "";
				var fromAddress = "";
				if (emailAccount.email_user_label)
					userLabel = emailAccount.email_user_label.toString() + " ";
				if (emailAccount.from)
					fromAddress = '&lt;' + emailAccount.from.toString() + '&gt;';
					
				uname = userLabel + fromAddress;
			}
		}
	}

	//If we somehow never got an identifier for the sender go with one of these two defaults
	if (!uname)
		if (current.user)
			uname = current.user.toString();
		else
			uname = "System";


	var usePlainTextResponseContent = gs.getProperty('glide.email_client.use_plain_text_response', 'false');

	var pattern = "EEEE dd, MMMMM hh:mm:ss a z";
    var simpleDateFormat = new Packages.java.text.SimpleDateFormat(pattern);
    simpleDateFormat.setTimeZone(Packages.java.util.TimeZone.getTimeZone(gs.getSession().getTimeZoneName()));
	var dateTimeFormat = simpleDateFormat.format(new Packages.java.util.Date(new GlideDateTime(current.sys_created_on).getNumericValue()));


	if ((usePlainTextResponseContent == 'true' && !current.body_text.isNil()) || current.body.isNil()) {
		template.print("On " + dateTimeFormat+", '" + uname + "' wrote:\n\n");
		// Process plain text to dislay in HTML email client
		template.print(sn_notification.EmailResponse.getOriginalEmailTextContent(current.getUniqueValue()));
	} else {
		template.print("<div class='ec-original-message'>On " + dateTimeFormat +", '" + uname + "' wrote:<br />");
		template.print("<blockquote>");
		// Remove html, head, body and style tags
		template.print(sn_notification.EmailResponse.getOriginalEmailHtml(current.getUniqueValue()));
		template.print("</blockquote></div>");
	}
	
	function getFormatedNameAndEmailFromUser(/*GlideRecord*/ user) {
		var userName = user.name.toString();
		if (user.email)
			userName += ' &lt;' + user.email.toString() + '&gt;';
	
		return userName;
	}
})(current, template, email, email_action, event);
