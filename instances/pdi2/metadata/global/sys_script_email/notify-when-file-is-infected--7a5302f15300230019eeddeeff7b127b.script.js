(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
/* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
/* Optional GlideRecord */ event) {
	// Add all users with admin or antivirus_admin role in BCC
	var adminRoleSysId = "2831a114c611228501d4ea6c309d626d";
	var antivirusAdminRoleSysId = "13a4cd4a73b2030052c11afe2ff6a7f1";
	var userRole = new GlideRecord("sys_user_has_role");
	var qc = userRole.addQuery("role", adminRoleSysId);
	qc.addOrCondition("role", antivirusAdminRoleSysId);
	userRole.query();
	while (userRole.next())
		email.addAddress("bcc", userRole.user.email, userRole.getDisplayValue("user"));

	var templateBody = "";
	// Add key message
	templateBody += "Attachment '"+ current.file_name + "' did not pass security scan" + "<hr/>";

	var parentRecord = new GlideRecord(current.table_name);
	parentRecord.get(current.table_sys_id);
	if (parentRecord.isValid()) {
		// Add table label
		templateBody += "<br/>" + parentRecord.getClassDisplayValue() + ": ";
		// Add record link
		var parentRecordLink = gs.getProperty('glide.servlet.uri') + current.table_name + ".do?sys_id=" + current.table_sys_id;
		var recordURL = "<a href='" + parentRecordLink + "'>" + sn_snap.InfectedAttachmentNotifier.getDisplayNameOfParent(parentRecord) + "</a>";
		templateBody += recordURL + "<br/>";
		// Add short description if available
		if (parentRecord.isValidField('short_description'))
			templateBody += "<br/>" + GlideStringUtil.escapeHTML(parentRecord.short_description)+ "<br/>";

		// Add details of infected file
		templateBody += "<br/>" + "The following attachment did not pass security scan: " + current.file_name + "<br/>";
		// Add action details
		templateBody += "<br/>" + "View this file from record " + recordURL;
	}

	// Display content
	template.print(templateBody);
})(current, template, email, email_action, event);
