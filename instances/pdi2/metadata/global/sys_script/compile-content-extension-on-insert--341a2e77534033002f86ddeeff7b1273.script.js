(function executeRule(current, previous /*null when async*/) {

	var wcu = new WorkspaceCompilerUtils();
	if (gs.nil(current.workspace_config) || !wcu.isValidUxPageRegistry(current.workspace_config.compiled_page_registry)) {
		if (gs.nil(current.workspace_config))
			gs.addErrorMessage('Could not compile module, missing Workspace record');
		else
			gs.addErrorMessage('Could not compile module, Workspace record not associated with UX Page Registry');
		return;
	}
	
	current.toolbar_button = wcu.createButton(current);
	
	if (current.type == 'full' || current.type == 'master_detail') {
		current.content = wcu.compilePrimaryContentExtension(current);
		
		if (current.type == 'master_detail') {
			current.detail = wcu.compileSecondaryContentExtension(current);
		}
	}
})(current, previous);
