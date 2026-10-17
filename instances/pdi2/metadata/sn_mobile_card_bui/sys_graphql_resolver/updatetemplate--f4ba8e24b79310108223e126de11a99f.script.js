(function process(/*ResolverEnvironment*/ env) {

	return new ViewTemplateRepository().update(env.getArguments().id, env.getArguments().template);
})(env);
