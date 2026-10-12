(function executeRule(current, previous /*null when async*/) {

    if(current.application)
		return null; 
	
	var tUritl = new sn_tourbuilder.TourBuilderUtility();
	current.application = tUritl.getAppDetails(current.tour);
})(current, previous);
