var SPMUtilsCoreImpl = Class.create();
SPMUtilsCoreImpl.prototype = {
    initialize: function() {
		this.SERVICE_EDITOR = 'service_editor';
		this.CMDB_CI_SERVICE = 'cmdb_ci_service';
		this.CMDB_CI_BUSINESS_SERVICE = 'cmdb_ci_service_business';
		this.CMDB_CI_TECHNICAL_SERVICE = 'cmdb_ci_service_technical';
		this.SERVICE_OFFERING_COMMITMENT = 'service_offering_commitment';
		this.currentUserId = gs.getUserID();	
    },

    /* 
	 * Returns a boolean speciying in the current user is owner, delegate of the offering.
	 * Will return true even if the current user is a owner, delegate of parent service or an owner of a node in the hierarchy.
	 * Else returns false.
	 */ 
	checkOfferingAuthorization: function(offeringGR) {
		var isOwner = offeringGR.owned_by.getValue() === this.currentUserId;
		if (gs.hasRole(this.SERVICE_EDITOR) && isOwner)
			return true;
		else
			return this.checkServiceAuthorization(offeringGR.parent);
    },

	/* 
	 * Returns true if the current user is a owner, delegate of a service or an owner of a node in the hierarchy.
	 * Else returns false.
	 */ 
	checkServiceAuthorization: function(serviceGR) {
		var isOwner = serviceGR.owned_by.getValue() === this.currentUserId;
		return (gs.hasRole(this.SERVICE_EDITOR) && isOwner);
    },
	
	/*
	 * Returns true if the service is supported in portfolio
	 */
	isValidService: function(className) {
		if (className == this.CMDB_CI_SERVICE || className == this.CMDB_CI_BUSINESS_SERVICE || className == this.CMDB_CI_TECHNICAL_SERVICE)
			return true;
		
		return false;
	},
	
	/*
	 * hasCommitments
	 * returns true if record has any commitments in the commitments table
	 */
	hasCommitments: function(recordId){
		var commitments = new GlideRecord(this.SERVICE_OFFERING_COMMITMENT);
		commitments.addQuery('service_offering', recordId);
		commitments.query();
		
		return (commitments.getRowCount() > 0);
	},
	
    type: 'SPMUtilsCoreImpl'
};
