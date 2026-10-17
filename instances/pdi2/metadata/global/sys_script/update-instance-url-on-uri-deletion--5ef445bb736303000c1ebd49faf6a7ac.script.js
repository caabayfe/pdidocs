(function executeRule(current, previous /*null when async*/) {
	
	// Calculate the correct url for the instance
	var isSetInstanceUrl = SNC.InstanceURLUtil.setCustomURLAsInstanceURL();
	if(isSetInstanceUrl == false)
		SNC.InstanceURLUtil.resetInstanceURL();
	
})(current, previous);
