(function executeRule(current, previous /*undefined when async or display*/) {
	var	filter = current.export_set.export_definition.filter;
	if(filter.indexOf(current.delta_on_or_after) > -1) {
		var msgArray = [];
		msgArray.push(current.export_set.export_definition.name);  
		msgArray.push(current.delta_on_or_after);
		var msg = gs.getMessage("Delta export configured with conflicting query. A conflicting query exists on the export definition '{0}'. Filter condition includes: {1}.", msgArray);
		gs.addErrorMessage(msg);
	}
})(current, typeof previous != 'undefined' ?  previous : null);
