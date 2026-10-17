(function process(/*TypeResolutionEnvironment*/ env) {
	return env.getObject().errorType ? 'Error' : 'ParentPlaybooks';
})(env);
