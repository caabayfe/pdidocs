var SubscriptionLicenseDetailDefinitionProvider = Class.create();
SubscriptionLicenseDetailDefinitionProvider.prototype = {
    initialize: function() {
        this._subscriptionEntitlementDao = new sn_sub_man.SubscriptionLicenseDetailDefinition_SubscriptionEntitlementDao();
        this._subscriptionDetailDao = new sn_sub_man.SubscriptionLicenseDetailDefinition_SubscriptionDetailDao();
    },

    /**
     * Retrieves the data for "Subscription license detail definition" remote table definition
     * 
     * @param {guid} The sys_id of the subscription_entitlement record the response should be limited to
     */
    getData: function(subscriptionId, type) {
        this._preLoadRecords(subscriptionId, type);

        // Guards
        if (((type === 'subscription_allotment_history')) && this._subscriptionIsCreator(subscriptionId))
            return [];

        // Reduce the records we process down to just the ones that may generate history records
        let relevantSubscriptionDetailRecords = this._subscriptionDetailRecords
            .filter(record => !subscriptionId || record.subscription === subscriptionId)
            .filter(record => this._isInputForSubscriptionAllotmentHistory(record));

        // Before we do any processing, identify the date entries we want and limit the record set to the records we care about
        const datesToKeep = this._extractRelevantDatesFromSubscriptionDetailRecords(relevantSubscriptionDetailRecords);
        relevantSubscriptionDetailRecords = relevantSubscriptionDetailRecords
            .filter(subscriptionDetailRecord => datesToKeep.indexOf(subscriptionDetailRecord.calculated_on) >= 0);


        // Process the records we care about
        return relevantSubscriptionDetailRecords
            .flatMap(subscriptionDetailRecord => this._mapSubscriptionDetailRecordToHistoryRow(subscriptionDetailRecord, type));
    },

    _generateAllocationHistory: function(type) {
        return !type || gs.nil(type) || type == "subscription_allotment_history";
    },

    _preLoadRecords: function(subscriptionId, type) {
        this._subscriptionRecords = this._subscriptionEntitlementDao.getSubscriptionEntitlementRecords();
        this._subscriptionDetailRecords = this._subscriptionDetailDao.getSubscriptionDetailRecordsByLastThreeMonthsAndOptionalSubscriptionIds([subscriptionId], false);
    },

    _extractRelevantDatesFromSubscriptionDetailRecords: function(subscriptionDetailRecords) {
        //extract the list of dates returned
        //filter out any null, empty, or undefined entries and then find only the latest of each month by sorting them, reversing the sort to put latest first and save the first encountered entry of any given month
        const sortedDates = subscriptionDetailRecords
            .map(entry => entry.calculated_on)
            .filter(Boolean)
            .sort((a, b) => b.localeCompare(a));

        const filteredDates = {};
        for (let curr of sortedDates) {
            const month = curr.split('-')[1]; // example date "2023-06-02 14:21:38"
            if (!filteredDates[month]) {
                filteredDates[month] = curr;
                if (Object.keys(filteredDates).length === 3) break; // stop after 3 unique dates
            }
        }

        return Object.values(filteredDates);
    },

    _subscriptionIsCreator: function(subscriptionId) {
        const matchingSubscriptions = this._subscriptionRecords
            .filter(record => record.sys_id === subscriptionId)
            .filter(record => record.meter_type && record.meter_type.toLowerCase() === 'creator');
        return matchingSubscriptions.length > 0;
    },

    _isInputForSubscriptionAllotmentHistory: function(subscriptionDetailRecord) {
        const migratedState = subscriptionDetailRecord.migrated_state ? subscriptionDetailRecord.migrated_state.toString() : "";
        return migratedState === "" || migratedState === "allocated";
    },

    _mapSubscriptionDetailRecordToHistoryRow: function(subscriptionDetailRecord, type) {
        const rows = [];

        const subscription_sysid = subscriptionDetailRecord.subscription;

        // DEF0616833: The discrepancy of calendar dates due to timezone difference caused inconsistent UI display. 
        // Any time between 10:00:01 UTC and 10:59:59 UTC, 99.999% of humanity as well as 100% of TimeZone 
        // selection on ServiceNow platform is on the same calendar date
        let calculated_on = subscriptionDetailRecord.calculated_on;
        if (!gs.nil(calculated_on)) {
            calculated_on = calculated_on.split(" ")[0] + " 10:30:00";
        }

        if (this._generateAllocationHistory(type) && this._isInputForSubscriptionAllotmentHistory(subscriptionDetailRecord)) {
            const purchased = this._subscriptionRecords
                .filter(subscriptionRecord => subscriptionRecord.sys_id === subscriptionDetailRecord.subscription)
                .map(subscriptionRecord => subscriptionRecord.purchased_count)
                .reduce((acc, curr) => Math.max(acc, curr), 0);
            const used = subscriptionDetailRecord.allocated_count;

            const available = Math.max(purchased - used, 0);
            const allocated = Math.min(used, purchased);
            const overAllocated = Math.max(used - purchased, 0);

            rows.push(this._createRow('available', available, subscription_sysid, calculated_on, 'subscription_allotment_history'));
            rows.push(this._createRow('allocated', allocated, subscription_sysid, calculated_on, 'subscription_allotment_history'));
            rows.push(this._createRow('over_allocated', overAllocated, subscription_sysid, calculated_on, 'subscription_allotment_history'));
        }

        return rows;
    },

    _createRow: function(name, value, subscriptionId, calculatedOn, historyType) {
        return {
            name: name,
            type: historyType,
            subscription: subscriptionId,
            value: Math.max(value ?? 0, 0),
            date: calculatedOn,
            sys_id: gs.generateGUID()
        };
    },

    type: 'SubscriptionLicenseDetailDefinitionProvider'
};
