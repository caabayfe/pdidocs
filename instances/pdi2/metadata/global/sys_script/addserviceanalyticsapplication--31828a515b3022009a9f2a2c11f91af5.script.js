(function executeRule(current, previous /*null when async*/) {
var serviceProcessor = new SNC.ServiceAnalyticsProcessor();
	var response=serviceProcessor.getApplicationResponse(current);
	if(response.getErrorStatus()==true){
	 gs.addErrorMessage(response.getErrorMessage());
	 current.setAbortAction(true);	
	}

})(current, previous);
