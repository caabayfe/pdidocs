(function executeRule(current, previous /*null when async*/) {
	var regex = /^\/?[\w$\-+!*'(),]+(\/?[\w$\-+!*'(),]+)*\/?$/gi;
	var newPathValue = current.path;
	
	if (!regex.test(newPathValue)) {
		current.setAbortAction(true);
		var errorMessage = gs.getMessage('Attempt to set UX Application path to an invalid value ("{0}"-invalid characters and/or formatting detected). Aborting.', GlideStringUtil.escapeHTML(newPathValue));
		gs.addErrorMessage(errorMessage);
	}
	
	var routes = newPathValue.split('/');
	var reservedRoutes = UxFrameworkScriptables.getReservedRoutes();
	
	for (var route in routes) {
		var part = routes[route];
		if (reservedRoutes.indexOf(part) >= 0) {
			current.setAbortAction(true);
			errorMessage = gs.getMessage('Attempt to set UX Application path to an invalid value ("{0}" is a reserved route). Aborting.', GlideStringUtil.escapeHTML(part));
			gs.addErrorMessage(errorMessage);
			break;
		}
	}
	
})(current, previous);
