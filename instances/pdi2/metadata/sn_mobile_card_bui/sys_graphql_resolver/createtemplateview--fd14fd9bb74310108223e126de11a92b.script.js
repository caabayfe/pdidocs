(function process(env) {
	return new ViewTemplateRepository().save(env.getArguments().template, env.getArguments().scope);
})(env);
