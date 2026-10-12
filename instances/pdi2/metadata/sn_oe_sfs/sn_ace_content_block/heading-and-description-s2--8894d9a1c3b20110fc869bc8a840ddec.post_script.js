(function(context) {
    try {
        var vars = JSON.parse(context.props_details.vars || '{}');
        vars.heading = gs.getMessage('Get pre-built topics for your NLU Virtual Agent');
        vars.desc = gs.getMessage('Install pre-built bot topic bundles to handle the most frequently asked questions and common self-service tasks for your department or industry.');
        context.props_details.vars = JSON.stringify(vars);
	} catch(e) {
	    gs.error('Error in translating messages in vars : ' + e.toString());
	}
})(context);
