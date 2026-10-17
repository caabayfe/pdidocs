function transform(input) {	
	var resp = {
		"hasBestPracticesChanged" : false,
		"release_version" : null,
		"number_of_best_practices_affected" :  null,
		"encodedQueryForAffectedBestPractices" : null
	};
	var securityCenterSysId = new sn_vsc.SecurityCenterConstants().SCPackage;
	var sysStorAppeGr = new GlideRecord("sys_store_app");
	sysStorAppeGr.addEncodedQuery("sys_id=" + securityCenterSysId);
	sysStorAppeGr.query();
	if (sysStorAppeGr.next()) {
		var securityCenterRelease = sysStorAppeGr.getDisplayValue("version");
		var bestPracticesGr = new GlideRecord("sn_vsc_best_practice_configurations");
		var encodedQuery = "first_introduced=" + securityCenterRelease + "^ORremoved=" + securityCenterRelease + "^ORchanged=" + securityCenterRelease;
		bestPracticesGr.addEncodedQuery(encodedQuery);
		bestPracticesGr.query();
		if (bestPracticesGr.next()) {
			// BPs has been changed / removed / updated
			resp["hasBestPracticesChanged"] = true;
			resp["release_version"] = securityCenterRelease;
			resp["number_of_best_practices_affected"] = bestPracticesGr.getRowCount();
			resp["encodedQueryForAffectedBestPractices"] = encodedQuery;
		}
	}
	return resp;
}
