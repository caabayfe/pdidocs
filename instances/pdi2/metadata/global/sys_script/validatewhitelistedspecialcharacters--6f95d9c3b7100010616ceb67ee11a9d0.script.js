(function executeRule(current, previous /*null when async*/ ) {
    // Test If whitelisted_special_characters contains non-special characters or contains Emojis or similar chars which are not supported.
    // If so, abort saving the record.
	var wsc = current.whitelisted_special_characters;
    var nonSpecialCharRegex = new RegExp("[a-zA-Z0-9]", "g");
    if (nonSpecialCharRegex.test(wsc) || (GlideStringUtil.notNil(wsc) && !SNC.PasswordPolicyUtil.isValidString(wsc))) {
		var link = '<a target="_blank" href="/api/now/v1/context_doc_url/unsupported-password-characters">Click here to learn more.</a>';
		var msg = "'Included Special Characters' field contains one or more non-special character(s) or un-supported character(s). " + link;
        gs.addErrorMessage(gs.getMessage(msg));
        current.setAbortAction(true);
    }

    // Clear Test password field before updating the record, so that it will never be stored.
    current.password = "";
})(current, previous);
