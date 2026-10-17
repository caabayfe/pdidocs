(function process( /*ResolverEnvironment*/ env) {
	var reqParms = {
		"reqIds" : env.getArguments()['reqIds'],
		"projectId" : env.getArguments()['projectId'],
		"findingDefId" : env.getArguments()['findingDefId'],
		"action": "unlink",
		"source": env.getArguments()['source']
	};
	
	return new global.ProminCOEUtil().updateAutomationReqM2M(reqParms);
})(env);
