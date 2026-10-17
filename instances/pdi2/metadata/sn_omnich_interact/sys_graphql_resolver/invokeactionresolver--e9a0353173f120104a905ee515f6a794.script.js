(function process(/*ResolverEnvironment*/ env) {

	var result = sn_snippets.QuickAction.invokeAction(env.getArguments()['table'],
												env.getArguments()['sysId'],
												env.getArguments()['message'],
												env.getArguments()['context']);
	return JSON.parse(result);

})(env);
