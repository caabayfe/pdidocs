(function process(/*ResolverEnvironment*/ env) {

    var payload = env.getArguments().processProperties;
	
	return new PADProcessPropertiesService().updateProcess(payload);

})(env);
