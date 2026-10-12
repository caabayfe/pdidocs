(function executeRule(current, previous /*null when async*/ ) {
    // Test If excluded_special_characters contains non-special characters or contains Emojis or similar chars which are not supported.
    // If so, abort saving the record.
	var esc = current.excluded_special_characters;
    var nonSpecialCharRegex = new RegExp("[a-zA-Z0-9]", "g");
    if (nonSpecialCharRegex.test(esc) || (GlideStringUtil.notNil(esc) && !SNC.PasswordPolicyUtil.isValidString(esc))) {
		var link = '<a target="_blank" href="/api/now/v1/context_doc_url/unsupported-password-characters">Click here to learn more.</a>';
		var msg = "'Excluded Special Characters' field contains one or more non-special character(s) or un-supported character(s). " + link;
        gs.addErrorMessage(gs.getMessage(msg));
        current.setAbortAction(true);
    }else if(!SNC.PasswordPolicyEvaluator.areValidSpecialCharacters(current.excluded_special_characters)){
		gs.addErrorMessage(gs.getMessage('Cannot exclude all special characters. After exclusion, there must be atleast 1 special characters left'));
		current.setAbortAction(true);
	}
	

	
    // Clear Test password field before updating the record, so that it will never be stored.
    current.password = "";
})(current, previous);
