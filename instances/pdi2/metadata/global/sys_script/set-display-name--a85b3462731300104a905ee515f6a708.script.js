(function executeRule(current, previous /*null when async*/) {

	if (gs.nil(current.user_document))
		current.display_name = current.channel_user_id;
	else {
		var docDisp = current.user_document.getDisplayValue();
		
		// remove table name prefix (e.g. "User: ") from doc display value
		var prefixEnd = docDisp.indexOf(':');
		if (prefixEnd >= 0)
			docDisp = docDisp.substring(prefixEnd + 2);
		current.display_name = docDisp;
	}
	
})(current, previous);
