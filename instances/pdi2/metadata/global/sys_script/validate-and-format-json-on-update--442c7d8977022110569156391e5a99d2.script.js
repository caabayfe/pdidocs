(function executeRule(current, previous /*null when async*/ ) {
    try {
		new JsonFormatterForMetadataRecords().formatJsonRecord(current);
	} catch (e) {
		gs.addErrorMessage(gs.getMessage("Unable to parse JSON for 'Properties': {0}", e));
		current.setAbortAction(true);
	}    
})(current, previous);
