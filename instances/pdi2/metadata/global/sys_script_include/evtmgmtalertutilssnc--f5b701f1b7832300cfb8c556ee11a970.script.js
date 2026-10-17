var EvtMgmtAlertUtilsSNC = Class.create();
EvtMgmtAlertUtilsSNC.prototype = {

    initialize: function() {
        this.alertManager = new SNC.AlertManager();
    },

    // Returns array of sys_ids of all the alerts associated with input alert
    getRelatedAlerts: function(alertGr) {
        if (!alertGr)
            return [];

        if (!alertGr.canRead())
            return [];

        var result = [];
        var parent = alertGr.parent + '';
        if (parent) {
            result.push(parent);
            result = result.concat(this.getSecondaryAlerts(parent));
        } else {
            result.push(alertGr.getUniqueValue());
            result = result.concat(this.getSecondaryAlerts(alertGr.getUniqueValue()));
        }
        return result;
    },

    // Returns array of sys_ids of all the secondary alerts associated with input alert
    getSecondaryAlerts: function(parent) {
        if (!parent)
            return [];
        var result = [];
        var secAlertGr = new GlideRecord('em_alert');
        secAlertGr.addQuery('parent', parent);
        secAlertGr.addQuery('severity', '!=', 5);
        secAlertGr.addQuery('maintenance', false);
        secAlertGr.orderByDesc('sys_created_on');
        secAlertGr.query();
        while (secAlertGr.next() && secAlertGr.canRead())
            result.push(secAlertGr.getUniqueValue());

        return result;
    },

    // Returns all the impacted services of input alert
    getAllImpactedServices: function(group, cmdbCi) {
        var services = new SNC.AlertManager().getImpactedServiceByAlert(group, cmdbCi);
        return services;
    },

    getGroupCisAndImpactedServices: function(group, cmdbCi) {
        // try/catch to protect against JS being more up-to-date than current node
        try {
            return new SNC.AlertManager().getGroupCisAndImpactedServices(group, cmdbCi);
        } catch (e) {
            gs.warn("getGroupCisAndImpactedServices failed to call SNC.AlertManager().getGroupCisAndImpactedServices()");
            return null;
        }
    },

    calculateBucket: function(key, classification) {
        if (key) {
            classification = classification ? classification : "IT";
            return SNC.EventManagementScriptableApis.calculateBucket(key, classification);
        }
        return null;
    },


    updateWorkNotesOnAlert: function(alertGr, message) {
        this.alertManager.updateWorkNotesOnAlert(alertGr, message);
    },

	getClosureReason: function(alertGr, message) {
        return this.alertManager.getClosureReason();
    },

	getAndRemoveClosureReason: function(alertGr, message) {
        return this.alertManager.getAndRemoveClosureReason();
    },

	setClosureReason: function(reason) {
        this.alertManager.setClosureReason(reason);
    },

    removeAlertsIdsFromAlertGroup: function(alertParentId, alertChildrenIds) {
        try {
            var resultRemove = new SNC.AlertManager().removeAlertsIdsFromAlertGroup(alertParentId, alertChildrenIds, true);
            if (resultRemove >= 0) {
                return {
                    status: 200
                };
            }
            return {
                status: 400,
                message: 'Error in the remove from alert group process'
            };
        } catch (error) {
            return {
                status: 400,
                message: error.message
            };
        }
    },

    addAlertsToGroups: function(alertParentId, alertChildrenIds) {
        try {
            var resultAdd = new SNC.AlertManager().addAlertsToGroups(alertChildrenIds, alertParentId, true);
            if (resultAdd === 0) {
                return {
                    status: 200
                };
            }
            return {
                status: 400,
                message: 'Error in the add to alert group process'
            };
        } catch (error) {
            return {
                status: 400,
                message: error.message
            };
        }
    },

    type: 'EvtMgmtAlertUtilsSNC'
};
