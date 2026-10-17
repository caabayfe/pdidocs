(function process( /*ResolverEnvironment*/ env) {

	const {
		scopeId,
		filterConditions
	} = env.getArguments();

	try {
		const requestApp = RequestAppService.getByScopeId(scopeId);
		return {
			...requestApp,
			queryParams: {
				requestAppId: requestApp.sysId,
				filterConditions,
			}
		};
	} catch (e) {
		return e;
	}

})(env);
