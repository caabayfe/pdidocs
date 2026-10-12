(function executeRule(current, previous /*null when async*/) {
	if(!current.salvage_value.changes()) {
		var currency = current.model.salvage_value.getCurrencyCode();
		var value =  current.model.salvage_value.getCurrencyValue();
		current.setValue('salvage_value', currency + ';' + value);
	}
	if(!current.depreciation.changes()){
		current.depreciation = current.model.depreciation;
	}
	if(!current.depreciation_date.changes() && current.depreciation) {
		if (GlidePluginManager.isActive('com.snc.procurement') && current.receiving_line) {
			current.depreciation_date = current.receiving_line.received;
		} else if (current.install_date) {
			current.depreciation_date = current.install_date;
		}
	}
	
})(current, previous);
