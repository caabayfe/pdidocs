var myCurrent = current;
		var serviceProcessor = new SNC.ServiceAnalyticsProcessor();
		var ret = serviceProcessor.runRuleCoverage(myCurrent);
		
		if (ret) {
			var msg = "Succeed in computing alert coverage for '" + myCurrent.getValue('name') + "'. Reload form to see the coverage percentage.";
			gs.addInfoMessage(gs.getMessage(msg));
		} else {
			var msg = "Failed in computing alert coverage for '" + myCurrent.getValue('name') + "'. ";
			gs.addErrorMessage(gs.getMessage(msg));
		}
		
		//action.setRedirectURL(myCurrent);
