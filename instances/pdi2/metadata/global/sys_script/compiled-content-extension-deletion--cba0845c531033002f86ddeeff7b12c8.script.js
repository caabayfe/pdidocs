(function executeRule(current, previous /*null when async*/) {
	var wcu = new WorkspaceCompilerUtils();
	
	wcu.deleteContentExtension(current.toolbar_button);
	wcu.deleteContentExtension(current.content);
	wcu.deleteContentExtension(current.detail);

})(current, previous);
