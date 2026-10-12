(function process(/*ResolverEnvironment*/ env) {
	var property = env.getArguments().property_name;
	return gs.getProperty(property) === 'false';
})(env);
