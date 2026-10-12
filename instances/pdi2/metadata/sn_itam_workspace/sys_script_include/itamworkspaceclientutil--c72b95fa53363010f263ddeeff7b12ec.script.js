var ITAMWorkspaceClientUtil = Class.create();
ITAMWorkspaceClientUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	getCustomAssetClasses: function() {
		return gs.getProperty('sn_itam_workspace.customExtendedAssetClasses');
	},

	getRecord: function() {
		var returnRec = {};
		var table = this.getParameter('sysparm_table_name');
		var product = this.getParameter('sysparm_product_name');
		var fields = this.getParameter('sysparm_fields');
		fields = (typeof fields === 'string') ? fields.split(',') : fields;

		var tableGr = new GlideRecordSecure(table);
		tableGr.addQuery('name', product);
		tableGr.query();

		if (tableGr.canRead() && tableGr.next()) {
			for (var field in fields) {
				returnRec[fields[field]] = tableGr[fields[field]] + '';
			}
		}
		return JSON.stringify(returnRec);
	},
	getDuplicateContracts: function() {
		var domain = new global.AssetManagementBaseJob().getCurrentDomainSysId();
		var domainVar = null;
		if (domain === 'global') { domainVar = domain; }
		return new sn_itam_workspace.ImportantActionsSetupQueries().getDuplicateContractQuery(
			true /* inEncodedQueryFormat */,
			domainVar
		);
	},
	getEAMModelClassesToBeExcluded: function() {
		if (AssetWorkspaceUtil.isHAMActive()
		// eslint-disable-next-line no-undef
		&& sn_hamp.HAMReportFilters.prototype.getEnterpriseModelClassesToBeExcluded) {
			// eslint-disable-next-line no-undef
			return new sn_hamp.HAMReportFilters().getEnterpriseModelClassesToBeExcluded();
		}
		return '';
	},
	getDomainsForImpActions: function(domainID) {
		var domains = new sn_itam_workspace.ImportantActionsSetupQueries().getChildDomains(domainID);
		domains.push('global');
		return domains;
	},

	type: 'ITAMWorkspaceClientUtil',
});
