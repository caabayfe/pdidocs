/**
 * Utility for managing service offerings on outage records 
 * @class OutageServiceOfferingUtilsSNC
 * @type {Class}
 */
var OutageServiceOfferingUtilsSNC = Class.create();
OutageServiceOfferingUtilsSNC.prototype = {
    TABLE: {
        OUTAGE: 'cmdb_ci_outage',
        OUTAGE_CI: 'cmdb_outage_ci_mtom',
        CMDB_CI: 'cmdb_ci'
    },

    STATUS: {
        ALREADY_REFRESHED: 'ALREADY_REFRESHED',
        REFRESHED: 'REFRESHED',
        ERROR: 'ERROR',
        NO_OFFERINGS: 'NO_OFFERINGS'
    },
    initialize: function() {},
    refreshAffectedServiceOfferings: function(outageRecord) {
        try {
            // First validate the record
            if (!outageRecord || typeof outageRecord.getUniqueValue !== 'function') {
                gs.addErrorMessage(gs.getMessage('Invalid outage record'));
                return {
                    success: false,
                    deletedCount: 0,
                    addedCount: 0,
                    status: this.STATUS.ERROR
                };
            }

            // Get the outage record if we were passed a sys_id
            var outageGR;
            if (typeof outageRecord === 'string') {
                outageGR = new GlideRecordSecure(this.TABLE.OUTAGE);
                if (!outageGR.get(outageRecord)) {
                    gs.addErrorMessage(gs.getMessage('Invalid outage record'));
                    return {
                        success: false,
                        deletedCount: 0,
                        addedCount: 0,
                        status: this.STATUS.ERROR
                    };
                }
            } else {
                outageGR = outageRecord;
            }

            var configItem = outageGR.getValue('cmdb_ci');
            if (!configItem || configItem.toString().trim() === '') {
                gs.addErrorMessage(gs.getMessage('No Configuration Item found on outage record'));
                var deletedCount = this._deleteExistingServiceOfferings(
                    outageGR.getUniqueValue(),
                    configItem // Pass the current CI sys_id
                );
                return {
                    success: false,
                    deletedCount: 0,
                    addedCount: 0,
                    status: this.STATUS.ERROR
                };
            }

            var currentOfferings = this._getCurrentOfferings(outageGR.getUniqueValue());
            var newOfferings = this._findRelatedOfferings(configItem);

            // Check if this is a subsequent click with no changes
            if (this._areOfferingsIdentical(currentOfferings, newOfferings, configItem)) {
                gs.addInfoMessage(gs.getMessage('The affected CIs list has already been refreshed for the selected configuration item'));
                return {
                    success: true,
                    deletedCount: 0,
                    addedCount: 0,
                    status: this.STATUS.ALREADY_REFRESHED
                };
            }

            var deletedCount = this._deleteExistingServiceOfferings(outageGR.getUniqueValue(), configItem);
            var addedCount = this._addServiceOfferings(outageGR.getUniqueValue(), configItem);

            // No offerings found on first attempt
            if (deletedCount === 0 && addedCount === 0 && Object.keys(currentOfferings).length === 0) {
                gs.addInfoMessage(gs.getMessage('No service offerings were found to add.'));
                return {
                    success: true,
                    deletedCount: 0,
                    addedCount: 0,
                    status: this.STATUS.NO_OFFERINGS
                };
            }

            // Normal refresh with changes
            var message = gs.getMessage('Service offerings refreshed in affected CI list: {0} removed, {1} added', [deletedCount, addedCount]);
            gs.addInfoMessage(message);

            return {
                success: true,
                deletedCount: deletedCount,
                addedCount: addedCount,
                status: this.STATUS.REFRESHED
            };

        } catch (ex) {
            gs.error("Error in refreshAffectedServiceOfferings: " + ex);
            return {
                success: false,
                deletedCount: 0,
                addedCount: 0,
                status: this.STATUS.ERROR
            };
        }
    },
    _getCurrentOfferings: function(outageSysId) {
        var currentOfferings = {};

        if (!outageSysId) {
            return currentOfferings;
        }

        try {
            var gr = new GlideRecordSecure(this.TABLE.OUTAGE_CI);
            gr.addQuery('outage', outageSysId);
            gr.addQuery('ci_item.sys_class_name', 'INSTANCEOF', 'service_offering');
            gr.query();
            while (gr.next()) {
                currentOfferings[gr.getValue('ci_item')] = true;
            }
        } catch (ex) {
            gs.error(gs.getMessage('Error getting current offerings: {0}', [ex]));
        }
        return currentOfferings;
    },

    _areOfferingsIdentical: function(currentOfferings, newOfferings, configItem) {
        var isServiceOffering = false;
        if (configItem) {
            var ciGR = new GlideRecord('cmdb_ci');
            if (ciGR.get(configItem) && ciGR.instanceOf('service_offering')) {
                isServiceOffering = true;
                currentOfferings[configItem] = true;
            }
        }
        var currentKeys = Object.keys(currentOfferings);

        // Convert newOfferings array to object
        var newOfferingsObj = {};
        for (var i = 0; i < newOfferings.length; i++) {
            newOfferingsObj[newOfferings[i]] = true;
        }
        // Add service offering CI to new offerings too
        if (isServiceOffering) {
            newOfferingsObj[configItem] = true;
        }
        var newKeys = Object.keys(newOfferingsObj);

        // If both are empty and we've already shown "no offerings" message
        if (currentKeys.length === 0 && newKeys.length === 0) {
            return true;
        }

        if (currentKeys.length !== newKeys.length) {
            return false;
        }

        for (var j = 0; j < currentKeys.length; j++) {
            if (!newOfferingsObj[currentKeys[j]]) {
                return false;
            }
        }

        return true;
    },
    _deleteExistingServiceOfferings: function(outageSysId, currentCISysId) {
        var deletedCount = 0;

        if (!outageSysId) {
            return deletedCount;
        }

        try {
            var isCurrentCIServiceOffering = false;
            if (currentCISysId) {
                var ciGR = new GlideRecord('cmdb_ci');
                if (ciGR.get(currentCISysId) && ciGR.instanceOf('service_offering')) {
                    isCurrentCIServiceOffering = true;
                }
            }
            var affectedGR = new GlideRecordSecure(this.TABLE.OUTAGE_CI);
            affectedGR.addQuery('outage', outageSysId);

            // Only delete if the offering is not the current CI
            if (currentCISysId) {
                affectedGR.addQuery('ci_item', '!=', currentCISysId);
            }
            affectedGR.addQuery('ci_item.sys_class_name', 'INSTANCEOF', 'service_offering');
            affectedGR.query();

            while (affectedGR.next()) {
                if (affectedGR.deleteRecord()) {
                    deletedCount++;
                }
            }
        } catch (ex) {
            gs.error(gs.getMessage('Error deleting existing service offerings: {0}', [ex]));
        }

        return deletedCount;
    },

    _findRelatedOfferings: function(ciSysId) {
        var offerings = [];
        var offeringMap = {};

        if (!ciSysId) {
            return offerings;
        }

        try {
            // Check where CI is child
            var relGR = new GlideRecordSecure('cmdb_rel_ci');
            relGR.addQuery('child', ciSysId);
            relGR.addQuery('parent.sys_class_name', 'INSTANCEOF', 'service_offering');
            relGR.query();
            while (relGR.next()) {
                    offeringMap[relGR.getValue('parent')] = true;
            }

            // Check where CI is parent
            relGR = new GlideRecordSecure('cmdb_rel_ci');
            relGR.addQuery('parent', ciSysId);
            relGR.addQuery('child.sys_class_name', 'INSTANCEOF', 'service_offering');
            relGR.query();
            while (relGR.next()) {
                    offeringMap[relGR.getValue('child')] = true;
            }

            // Check Service Mapping associations with dot-walking
            var svcAssocGR = new GlideRecordSecure('svc_ci_assoc');
            svcAssocGR.addQuery('ci_id', ciSysId);
            svcAssocGR.addQuery('service_id.sys_class_name', 'INSTANCEOF', 'service_offering');
            svcAssocGR.query();
            while (svcAssocGR.next()) {
                    offeringMap[svcAssocGR.getValue('service_id')] = true;
            }

            offerings = Object.keys(offeringMap);
        } catch (ex) {
            gs.error(gs.getMessage('Error finding related offerings: {0}', [ex]));
        }

        return offerings;
    },

    _addServiceOfferings: function(outageSysId, configItem) {
        var addedCount = 0;

        if (!outageSysId || !configItem) {
            return addedCount;
        }

        try {
            var offerings = this._findRelatedOfferings(configItem);
            if (!offerings || offerings.length === 0) {
                return addedCount;
            }

            for (var i = 0; i < offerings.length; i++) {
                var mtomGR = new GlideRecordSecure(this.TABLE.OUTAGE_CI);
                mtomGR.initialize();
                mtomGR.outage = outageSysId;
                mtomGR.ci_item = offerings[i];
                if (mtomGR.insert()) {
                    addedCount++;
                }
            }
        } catch (ex) {
            gs.error(gs.getMessage('Error adding service offerings: {0}', [ex]));
        }

        return addedCount;
    },

    type: 'OutageServiceOfferingUtilsSNC'
};
