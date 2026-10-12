(function process(/*ResolverEnvironment*/ env) {

    var params = {
        "entityId": env.getArguments()['entityId'],
        "processId": env.getArguments()['processId'],
    };
	return new sn_po.ProminProjectDefUtil().idleTimeConfiguration(params);

})(env);
