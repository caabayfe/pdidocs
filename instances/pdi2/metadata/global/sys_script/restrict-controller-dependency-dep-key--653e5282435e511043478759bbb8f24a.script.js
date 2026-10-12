(function executeRule(current, previous /*null when async*/) {

	if (!current.controller_dependencies)
		return;
	
	var controllerDependencies;
	try {
		controllerDependencies = JSON.parse(current.controller_dependencies);
	} catch(e) {
		gs.warn("Unable to parse controller dependencies", e);
	}
	
	var invalidControllers = controllerDependencies.filter(function(controller, index) {
		return controller.depKey === 'controller';
	}).map(function(controller) {
		return controller.definition && controller.definition.name || 'undefined';
	});
	if(invalidControllers.length > 0) {
	    var message = gs.getMessage("\"controller\" is a reserved key for a single controller in an extension point. Please specify a different depKey in the Controller Dependencies field for: {0}", invalidControllers.join(', '));
		gs.addErrorMessage(message);
		current.setAbortAction(true);
		return;
	}

})(current, previous);
