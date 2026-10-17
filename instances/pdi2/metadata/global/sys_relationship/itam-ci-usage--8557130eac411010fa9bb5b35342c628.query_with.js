(function refineQuery(current, parent) {

	var fIsDomainDataSeparationEnabled = new global.ITAMLicensingUtils().isDomainSeparationEnabled();
	if(parent.application.toString() === SAMLicensingUtility.SAM_APP)
		current.addQuery('sam', true);
	else if(parent.application.toString() === SAMLicensingUtility.CI_APP)
		current.addQuery('cloud_insights', true);
	current.addQuery('resource_category', parent.resource_category);
	if (fIsDomainDataSeparationEnabled) {
		current.addQuery('sys_domain', parent.sys_domain);
	}

})(current, parent);
