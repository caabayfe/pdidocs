(function process(/*ResolverEnvironment*/ env) {
	var prefName = env.getArguments().name;
	var prefValue = env.getArguments().value;
	var currentUser = gs.getUser(); 

	if (!prefName || !currentUser) return;
	currentUser.savePreference(prefName, prefValue);
	return {"name" : prefName, "value" : prefValue};
})(env);
