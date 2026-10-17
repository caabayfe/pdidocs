(function executeRule(current, previous /*null when async*/) {

	var dataBrokers;
	try {
		dataBrokers = JSON.parse(current.data);
	} catch(e) {
		gs.warn("Unable to parse controller data", e);
	}
	
	var invalidElements = dataBrokers.filter(function(dataBroker, index) {
		return dataBroker.elementId === 'controller';
	}).map(function(dataBroker) {
		return dataBroker.elementLabel;
	});
	
	if(invalidElements.length > 0) {
	    var message = gs.getMessage("\"controller\" is a reserved key for a single controller in an extension point. Please specify a different element Id in data field for: {0}", invalidElements.join(', '));
		gs.addErrorMessage(message);
		current.setAbortAction(true);
		return;
	}
})(current, previous);
