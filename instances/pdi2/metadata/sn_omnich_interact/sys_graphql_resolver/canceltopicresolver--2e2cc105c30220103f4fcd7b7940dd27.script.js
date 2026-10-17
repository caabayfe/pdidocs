(function process(/*ResolverEnvironment*/ env) {

	var result = sn_cs.VASystemObject.cancelCurrentTopic(env.getArguments()['conversationId']);
	return {message: result.getMessage(), success: result.isSuccess()};

})(env);
