(function executeRule(current, previous /*null when async*/) {
	
	var defaultVendorName = gs.hasRole('maint') ? 'ServiceNow' : '';
	current.author = gs.getProperty('glide.appcreator.company.friendly_name', defaultVendorName);
	
})(current, previous);
