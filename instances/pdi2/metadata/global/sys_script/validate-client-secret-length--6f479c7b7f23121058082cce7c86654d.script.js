(function executeRule(current, previous /*null when async*/ ) {
	var clientSecretAutoGenLength = new GlideBoundedIntProperty("com.glide.oauth.client_secret.auto_generate_length", 32, 10, 4096).getInt();
	var clientSecretFieldLength = current.isNewRecord() ? clientSecretAutoGenLength : current.client_secret.getDecryptedValue().length;
	if (clientSecretAutoGenLength < 32 && clientSecretFieldLength < 32) {
		g_scratchpad.showClientSecretLengthWarning = true;
		g_scratchpad.clientSecretWarningMessage =  gs.getMessage('The recommended minimum client secret length is now 32 characters. Update it manually or set the system property "{0}" to 32 or more, clear the field, and save to auto-generate a new one.', "com.glide.oauth.client_secret.auto_generate_length");
	} else if (clientSecretAutoGenLength >= 32 && clientSecretFieldLength < 32) {
		g_scratchpad.showClientSecretLengthWarning = true;
		g_scratchpad.clientSecretWarningMessage = gs.getMessage("The recommended minimum client secret length is now 32. Either update it manually or clear the field and save to auto-generate a new one.");
	} else
		g_scratchpad.showClientSecretLengthWarning = false;
})(current, previous);
