var EvtMgmtImpactedServiceGroups = Class.create();
EvtMgmtImpactedServiceGroups.prototype = {
   initialize: function() {
        this.arrayUtil = new ArrayUtil();
        this.impactedServiceGroupsSysIds = [];
		this.ALL_GROUP_SYS_ID = "0e7a06157f10310016181ccebefa91ce";
    },

    type: 'ImpactedServiceGroups',

    /**
     * Returns an array of  sys ids of impacted service groups for the given services CIs sys ids
     * @param cisSysIds - string[]
     * @returns string[]
     */
    getImpactedServiceGroups: function(cisSysIds) {
		this.impactedServiceGroupsSysIds = [];
        var serviceGroups = this.getServiceGroups(cisSysIds);
        return this.impactedServiceGroups(serviceGroups);
    },
	
    /**
     * Returns an array of service groups sys ids that contain the given services sys ids
     * @param containingServices - string[]
     * @returns string[]
     */
    getServiceGroups: function(cisSysIds) {
        return this.getUniqueSysIds(cisSysIds, 'sa_service_group_member', 'service', 'service_group');
    },

    /**
     * Returns an array of service groups sys ids that contain the given service groups sys ids
     * @param serviceGroups - string[]
     * @returns string[]
     */
    impactedServiceGroups: function(serviceGroups) {
        if (serviceGroups && serviceGroups.length) {
			this.arrayUtil.concat(this.impactedServiceGroupsSysIds, serviceGroups);
			var impactedGroupsParents = [];
			do {
				impactedGroupsParents = this.getParentServiceGroups(serviceGroups);
				if (impactedGroupsParents.length) {
					this.arrayUtil.concat(this.impactedServiceGroupsSysIds, impactedGroupsParents);
					serviceGroups = impactedGroupsParents;
				}
			}
			while(impactedGroupsParents.length);
        }

		this.impactedServiceGroupsSysIds = this.arrayUtil.unique(this.impactedServiceGroupsSysIds);
		return this.removeGroupAll(this.impactedServiceGroupsSysIds);
    },

    /**
     * Returns an array of service groups sys ids and their parents sys ids
     * @param serviceGroups - string[]
     * @returns string[]
     */
    getParentServiceGroups: function(serviceGroups) {

        if (!serviceGroups || !serviceGroups.length) {
            return [];
        }
		
		return this.getUniqueSysIds(serviceGroups, 'cmdb_ci_service_group', 'sys_id', 'parent_group');
    },

    /**
     * Helper function that returns an array with of unique sys ids from the given table by given parameters
     * @param sysIds - the sys ids to search for
     * @param table - the table to search in
     * @param queryField - the field to look for a match with the sys ids
     * @param targetField - the field to return from the table
     * @returns string[]
     */
    getUniqueSysIds: function(sysIds, table, queryField, targetField) {
        var values = [];
		sysIds = this.removeGroupAll(sysIds);
        if (sysIds && sysIds.length) {
            var gr = new GlideRecord(table);
            gr.addQuery(queryField, 'IN', sysIds.join(','));
            gr.query();
            while (gr.next()) {
				if (gr.getValue(targetField)) {
            		values.push(gr.getValue(targetField));
            	}
            }
        }

        return this.arrayUtil.unique(values);
    },
	
	removeGroupAll: function(array) {
		return this.arrayUtil.diff(array, [this.ALL_GROUP_SYS_ID]); // Remove the group ALL 
	}
};
