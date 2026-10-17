(function executeRule(current, previous /*null when async*/) {
	
	if(current.base_version.nil()){
		// If the article is not a checked out version, initialize the minor version
		if(current.workflow_state=='published' || (new KBCommon().isExternalArticle(current)))
			new KBVersioning().incrementMajorVersion(current);
		else 
			new KBVersioning().incrementMinorVersion(current);
	}
})(current, previous);
