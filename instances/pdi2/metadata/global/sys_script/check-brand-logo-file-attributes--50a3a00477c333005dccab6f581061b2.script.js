(function executeRule(current, previous /*null when async*/) {

	// Check Brand Logo file size and discard upload if greater than specific size 120 KB 
	var maxFileSize = 120; // 120 KB
	
	if (current.workspace_logo !== previous.workspace_logo){
		var att = new GlideRecord('sys_attachment');
		att.addQuery('sys_id', current.workspace_logo);
		att.query();
		while (att.next()){
			var isFileLarge = att.getValue('size_bytes') > maxFileSize * 1024;
			if (isFileLarge){
				att.deleteRecord();
				if (isFileLarge) {
					gs.addErrorMessage(gs.getMessage("Custom logo should be no larger than {0} KB", maxFileSize));
				}
				current.setAbortAction(true);	
			}
		}
	}

})(current, previous);
