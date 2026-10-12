(function process(env) {
	
	return new ViewConfigRepository().update(env.getArguments().id, env.getArguments().viewConfig);
})(env);
