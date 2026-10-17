(function process(/*ResolverEnvironment*/ env) {
	return new ViewConfigRepository().save(env.getArguments().viewConfig);
    // implement data resolver here

})(env);
