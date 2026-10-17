(function process( /*ResolverEnvironment*/ env) {
	
	var result = sn_snippets.QuickAction.loadActionToolbarControls(env.getArguments()['table'],
															env.getArguments()['sysId']);
	return JSON.parse(result);
	
})(env);
