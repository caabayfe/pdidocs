(function process(/*ResolverEnvironment*/ env) {
		var reqParms = {
		table: env.getArguments()['table']
	};
    return new global.ProminCOEUtil().getProcessConfig(reqParms);
})(env);
