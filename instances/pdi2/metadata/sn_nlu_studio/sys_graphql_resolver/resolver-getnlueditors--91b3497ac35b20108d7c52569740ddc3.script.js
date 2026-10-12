(function process(/*ResolverEnvironment*/ env) {
    
	try {
		var editors = global.NLUSystemUtil.getNLUEditors();
		return {
			status: 'success',
			editors: editors
		};
	} catch(e) {
		return {
			status: 'failure',
			error: e.message
		};
	}

})(env);
