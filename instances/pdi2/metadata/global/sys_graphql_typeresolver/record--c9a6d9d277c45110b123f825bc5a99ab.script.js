(function process(/*TypeResolutionEnvironment*/ env) {
	return !gs.nil(env.getObject().errorType) ? 'Error' : 'ProcessPropertiesUpdateResult';
})(env);
