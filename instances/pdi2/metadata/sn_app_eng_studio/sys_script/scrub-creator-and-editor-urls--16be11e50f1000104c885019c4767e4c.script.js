(function executeRule(current, previous /*null when async*/) {

	// Verify that neither the creator or editor URLs contain any new lines.
	
	var creatorUrl = current.creator_url;
	var editorUrl = current.editor_url;
	
	if (!gs.nil(creatorUrl))
		current.creator_url = stripNewLineChars(creatorUrl);
	
	if (!gs.nil(editorUrl))
		current.editor_url = stripNewLineChars(editorUrl);

	function stripNewLineChars(rawUrl) {
		var newLineExpr = /\r?\n|\r/g;
		return rawUrl.replace(newLineExpr, "");
	}
	
})(current, previous);
