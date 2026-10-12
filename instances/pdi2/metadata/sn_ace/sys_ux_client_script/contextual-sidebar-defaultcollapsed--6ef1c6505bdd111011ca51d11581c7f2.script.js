function evaluateProperty({api}) {
	//by default collapse the contextual sidebar incase userPrefs is undefined
	if(!api.context.props.userPrefs)
		return true; 
	return api.context.props.userPrefs['workspace.showAgentAssist'] != 'true';
}
