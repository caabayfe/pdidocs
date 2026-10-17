(function executeRule(current, previous /*null when async*/ ) {
	var spmAutomationUtils = new global.SPMAutomationUtils();
	spmAutomationUtils.createOneManyOfferings(current);
	if(spmAutomationUtils.totalNumOfferingsCreated > 0) 
		gs.addInfoMessage(gs.getMessage('According to the portfolio configuration, {0} child offering(s) were created for {1}.', [spmAutomationUtils.totalNumOfferingsCreated.toString(), current.name]));
})(current, previous);
