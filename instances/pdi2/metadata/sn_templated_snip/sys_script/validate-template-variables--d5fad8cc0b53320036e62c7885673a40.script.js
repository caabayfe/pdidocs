(function executeRule(current, previous /*null when async*/) {
	var noteTemp = new NoteTemplate();
	var result = noteTemp.validateTemplate(current.html_script_body, current.table);
	var body = result[0];
	
	var unEvaluatedVariables = result[1];
	var inaccessibleVariables = result[2];
	current.html_script_body = body;
	if ((unEvaluatedVariables.length > 0) || (inaccessibleVariables.length > 0)) {
		var errStr = '';
		if (unEvaluatedVariables && unEvaluatedVariables.length > 0) {
			errStr = gs.getMessage("Following variables are not valid or defined:");
			for (var i=0; i<unEvaluatedVariables.length; i++) {
				errStr += ' ' + unEvaluatedVariables[i];
				if (i != unEvaluatedVariables.length - 1)
					errStr += ',';
			}
			gs.addErrorMessage(errStr);
		}
		
		if (inaccessibleVariables && inaccessibleVariables.length > 0) {
			errStr = gs.getMessage("Following variables are not accessible based on your permissions:");
			for (var j=0; j<inaccessibleVariables.length; j++) {
				errStr += ' ' + inaccessibleVariables[j];
				if (j != inaccessibleVariables.length - 1)
					errStr += ',';
			}
			gs.addErrorMessage(errStr);
		}
		current.setAbortAction(true);
		return false;
	}
})(current, previous);
