(function executeRule(current, previous /*null when async*/) {
	var createdOn = new GlideDateTime(current.sys_created_on);
	var updatedOn = new GlideDateTime(current.sys_updated_on);
	var difference = updatedOn.getNumericValue() - createdOn.getNumericValue();
	// this check eliminates updates that happen during article check out, avoiding running unnecessary scans
	if (difference > 3000) { 
		var utils = new sn_km_center.ArticleAssistUtils();
		utils.runScansOnUpdate(current);
	}
})(current, previous);
