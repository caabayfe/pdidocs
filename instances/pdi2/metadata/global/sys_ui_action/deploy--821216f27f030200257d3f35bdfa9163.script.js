var myCurrent = current;
var serviceProcessor = new SNC.ServiceAnalyticsProcessor();
var ret = serviceProcessor.deploySnapshotConfig(myCurrent);
		
if (ret) {
	var msg = "Succeeded in deploying config '" + myCurrent.getValue('name') + "'.";
	gs.addInfoMessage(gs.getMessage(msg));
} else {
	var msg = "Failed in deploying config '" + myCurrent.getValue('name') + "'. ";
	gs.addErrorMessage(gs.getMessage(msg));
}
		
//action.setRedirectURL(myCurrent);
