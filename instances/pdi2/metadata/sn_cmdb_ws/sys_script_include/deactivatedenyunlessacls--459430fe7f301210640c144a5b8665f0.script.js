var DeactivateDenyUnlessACLs = Class.create();
DeactivateDenyUnlessACLs.prototype = {
    initialize: function() {},

    deactivateDenyUnlessACLsOnUpgrade: function(aclSysIds) {
        var response = {
            status: 'success', // Default to 'success' unless an error occurs
            message: '',
            skippedIds: [],
            deactivatedCount: 0
        };

        if (!aclSysIds) {
			response.status = 'error';
			response.message = 'No SysIds provided.';
			return response;
        }

        try {
            // Check if the Data Filter Upgrade Helper API exists
            if (this.checkIfDataFilterUpgradeHelperAPIExists()) {
                var skippedIds = this.deactivateACLs(aclSysIds);

                // Log the result and update response data
                if (skippedIds.length === 0) {
                    gs.info("CMDB WS: deactivateDenyUnlessACLsOnUpgrade >> Successfully deactivated all 'Deny unless UserIsAuthenticated' ACLs during upgrade.");
                    response.message = "All ACLs were successfully deactivated.";
                } else {
                    gs.info("CMDB WS: deactivateDenyUnlessACLsOnUpgrade >> Skipped the following ACL sys_ids during deactivation: " + skippedIds);
                    response.status = 'partial_success';
                    response.message = "Some ACLs were skipped during deactivation.";
                    response.skippedIds = skippedIds;
                }

                response.deactivatedCount = aclSysIds.length - skippedIds.length;
            } else {
                gs.info("CMDB WS: deactivateDenyUnlessACLsOnUpgrade >> Data Filter Upgrade Helper API does not exist; skipping deactivation of ACLs.");
                response.status = 'skipped';
                response.message = "Deactivation skipped as Data Filter Upgrade Helper API does not exist.";
            }
        } catch (error) {
            gs.error("CMDB WS: deactivateDenyUnlessACLsOnUpgrade >> An error occurred while deactivating ACLs: " + error.message);
            response.status = 'error';
            response.message = "An error occurred during ACL deactivation: " + error.message;
        }

        return response;
    },

    checkIfDataFilterUpgradeHelperAPIExists: function() {
        try {
            snDataFilterUpgradeHelperAPIExists = sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI ? true : false;
        } catch (error) {
            return false;
        }
        return snDataFilterUpgradeHelperAPIExists;
    },

    deactivateACLs: function(aclSysIds) {
        var api = new sn_security_upgrade_utils.SlowRolloutUpgradeHelperAPI();
        return api.deactivateACLsAndFiltersOnUpgrade(aclSysIds);
    },

    type: 'DeactivateDenyUnlessACLs'
};
