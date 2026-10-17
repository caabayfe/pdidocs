function onBefore(current, previous) {
	ensureProduces();
	ensureConsumes();
}

function ensureProduces() {
	// if current.produces is empty, force it to parent and unset override flag
	if (current.produces == '')
		current.produces_customized = false;
	
	// if produces is not customized, restore it to parent setting
	if (current.produces == '' || (!current.produces_customized && current.produces != previous.produces && previous.produces != '')) {
		current.produces = current.web_service_definition.produces;
		if (!current.propagating_from_parent)
			gs.addInfoMessage(gs.getMessage('Supported response formats are not overridden, so resetting to parent default. To override, use the corresponding override checkbox.'));
	}
	
}

function ensureConsumes() {
	// if current.consumes is empty, force it to parent and unset override flag
	if (current.consumes == '')
		current.consumes_customized = false;
	
	// if consumes is not customized, restore it to parent setting
	if (current.consumes == '' || (!current.consumes_customized && current.consumes != previous.consumes && previous.consumes != '')) {
		current.consumes = current.web_service_definition.consumes;
		if (!current.propagating_from_parent)
			gs.addInfoMessage(gs.getMessage('Supported request formats are not overridden, so resetting to parent default. To override, use the corresponding override checkbox.'));
	}
}
