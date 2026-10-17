(function process(/*ResolverEnvironment*/ env) {

    return {
		conversationSysId: env.getArguments()["conversationSysId"],
        type: env.getArguments()["type"]
	};
})(env);
