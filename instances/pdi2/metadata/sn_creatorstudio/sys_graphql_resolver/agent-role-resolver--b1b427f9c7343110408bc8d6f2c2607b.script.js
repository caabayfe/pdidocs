(function process(/*ResolverEnvironment*/ env) {
	
	const { requestTable, scopeId } = env.getSource();

	try {
		const agentRoles = RequestAppService.getAgentRoleForRequestApp(requestTable, scopeId);
		return agentRoles;
	} catch (e) {
		return e;
	}

})(env);
