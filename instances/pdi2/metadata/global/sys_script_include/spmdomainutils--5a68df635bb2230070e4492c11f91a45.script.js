var SPMDomainUtils = Class.create();
SPMDomainUtils.prototype = {
    initialize: function() {
    },
	
	isInSameDomain: function(gr1, gr2) {
		//If sys_domain is not a valid field, return true since domain separation is not supported
		if (!gr1.isValidField('sys_domain')) {
			return true;
		}
		if (!gr2.isValidField('sys_domain')) {
			return true;
		}
		
		var gr1_domain = gr1.getValue('sys_domain');
		var gr2_domain = gr2.getValue('sys_domain');
		
		//If sys_domain is empty or global, return true 
		if (gr1_domain == '' || gr1_domain == 'global') {
			return true;
		}
		if (gr2_domain == '' || gr2_domain == 'global') {
			return true;
		}
		
		//If the domains are the same, return true
		if (gr1_domain == gr2_domain) {
			return true;
		}

		return false;
	},
	
	areServiceCommitmentGrsInSameDomain: function(current) {
		var serviceOffering = current.service_offering;
		var cmdbCi = current.cmdb_ci;
		var commitment = current.service_commitment;
		if (serviceOffering)
			serviceOffering = serviceOffering.getRefRecord();
		if (cmdbCi)
			cmdbCi = cmdbCi.getRefRecord();
		if (commitment)
			commitment = commitment.getRefRecord();
		var gr = serviceOffering || cmdbCi;
		return this.isInSameDomain(gr, commitment);
	},

    type: 'SPMDomainUtils'
};
