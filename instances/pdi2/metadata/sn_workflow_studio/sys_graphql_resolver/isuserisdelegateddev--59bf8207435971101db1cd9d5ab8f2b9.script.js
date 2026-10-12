(function process(/*ResolverEnvironment*/ env) {
	var entity = env.getArguments().entity_name;
    var wfstudioUtils = new sn_workflow_studio.WFStudioUtils();
	switch(entity) {
		case 'DecisionTables':
			return wfstudioUtils.userIsDecisionTablesDelegatedDev();
		case 'FlowDesigner':
			return wfstudioUtils.userIsFDDelegatedDev();
		case 'ProcessAutomationDesigner':
			return wfstudioUtils.userIsPADDelegatedDev();
		default:
			return false;
	}
})(env);
