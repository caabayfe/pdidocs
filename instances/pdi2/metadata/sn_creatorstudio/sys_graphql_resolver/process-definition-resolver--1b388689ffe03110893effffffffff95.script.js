(function process( /*ResolverEnvironment*/ env) {
    const {
        requestAppId,
        filterConditions,
    } = env.getSource();
	const queryString = (filterConditions || {}).processes;

	try {
		return ProcessDefinitionService.getProcessesInRequestApp(requestAppId, queryString);
	} catch(e) {
		return e;
	}
})(env);
