(function process( /*ResolverEnvironment*/ env) {
	
	var result = sn_snippets.QuickAction.searchParams(env.getArguments()['commandName'],
												env.getArguments()['query'],
												env.getArguments()['table'],
												env.getArguments()['sysId'],
												env.getArguments()['index'],
												env.getArguments()['paginationToken']);
	return JSON.parse(result);
	
})(env);
