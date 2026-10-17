(function executeRule(current, previous /*null when async*/) {

    //Check if old licensing model is enabled
    var licenceHelper = new SaHashNewLicenceHelper();
    var newLicense = licenceHelper.isNewLicence();
    //in case of DB error/first time, check licence status not from sa_hash helper
    if (newLicense === undefined) {
        var itomLicensingUtils = new sn_itom_licensing.ITOMLicensingUtilsStore();
        newLicense = itomLicensingUtils.isNewLicenseModel();
        licenceHelper.setNewLicence(newLicense);
    }
    if (newLicense) {
        return;
    }

	// Get ci
	var ci = current.cmdb_ci;
	
	// Get domain from metric map
	var metricMapDomain = current.sys_domain;
	
	//If ci is empty or metric_type_id is empty, do nothing
	if(GlideStringUtil.nil(ci) || GlideStringUtil.nil(current.metric_type_id)) {
		return;
	}
	
	var createdOn = new GlideDateTime(current.sys_created_on);
	createdOn.addDaysUTC(-365);
	
	var gr = new GlideRecord('sa_metric_ci_tracker');
	gr.addQuery('cmdb_ci', ci);
	gr.addQuery('sys_created_on', '>=', createdOn );
	gr.query();
	if(!gr.next()) {
		//Create record
		var grCreate = new GlideRecord('sa_metric_ci_tracker');
		grCreate.setValue('cmdb_ci', ci);
		if (metricMapDomain == 'global') {
			var domainToUse = 'global';
			var origDomainID = gs.getSession().getCurrentDomainID();
			try {
				gs.getSession().setDomainID(domainToUse);	
				grCreate.insert();
			} finally {
				gs.getSession().setDomainID(origDomainID);
			}
		}
		else {
			grCreate.sys_domain = metricMapDomain;
			grCreate.insert();
		}
	}

})(current, previous);
