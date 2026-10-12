(function process(/*ResolverEnvironment*/ env) {

    var params = {
        "projectId": env.getArguments()['projectId'],
        "processId": env.getArguments()['processId'],
    };
	return new sn_po.ProminProjectDefUtil().touchPointsStatus(params);

})(env);
