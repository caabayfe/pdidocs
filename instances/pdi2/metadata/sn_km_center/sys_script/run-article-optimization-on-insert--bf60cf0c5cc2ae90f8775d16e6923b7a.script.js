(function executeRule(current, previous /*null when async*/) {
	var utils = new sn_km_center.ArticleAssistUtils();
	if (!current.base_version) { 
		utils.runScansOnUpdate(current);
	} else { 
		utils.copyResultsOnCheckout(current);
	}
})(current, previous);
