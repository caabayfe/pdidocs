(function process(/*ResolverEnvironment*/ env) {

    var sysId = env.getArguments().sysId;
	
	return new PADActivityService().deleteRecord(sysId);
	
})(env);
