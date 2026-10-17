(function() {  
	
	/**
	 * This business rule synchs disco_run_type changes and legacy run_type changes.
	 * If both are changed on the same insert or update, disco_run_type will take priority.
	 */

	var crt = new DiscoveryScheduleRunType(current.disco_run_type + '');
	
	if (current.operation() == "insert") {
		// If this is an insert, and disco_run_type was not actually changed ('daily' is the default)
		// check if the legacy run_type changed and update disco_run_type accordingly.
		if (current.disco_run_type + '' == crt.DAILY && current.run_type + '' != crt.DAILY)
			current.disco_run_type = current.run_type;
		else
			current.run_type = crt.getLegacyConversion();
	} else {
		if (current.disco_run_type.changes())
			current.run_type = crt.getLegacyConversion();
		else 
			current.disco_run_type = current.run_type;
	}


})();  
