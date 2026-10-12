(function process(/*TypeResolutionEnvironment*/ env) {
	return env.getObject().errorType ? 'Error' : (env.getObject().sysId ? 'SysId' : 'ProcessData');
})(env);
