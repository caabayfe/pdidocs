var dao_SubscriptionDetail = Class.create();
dao_SubscriptionDetail.prototype = {
    initialize: function() {
        this._detailTable = "subscription_detail";
        this._entitlementTable = "subscription_entitlement";
        this._isV2Schema = new sn_entitlement.UnallocatedEntityCalculation_ContextFactory().v2SchemaIsInUse();
        this._v1Dao = new sn_entitlement.dao_SubscriptionDetailDaoV1();
    },

    /**
     * Creates a set of subscription_detail records in the database and returns a object map of subscription_entitlement ids to subscription_detail ids
     *
     *
     * @return {object} an object map of subscription_entitlement sysids to subscription_detail sysids
     */
    createSubscriptionDetailsMap: function() {
        if (!this._isV2Schema)
            return this._v1Dao.createSubscriptionDetailsMap();

        let objectMap = {};
        const entitlementGr = new GlideRecord(this._entitlementTable);
		entitlementGr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        entitlementGr.query();
        const calculatedOn = new GlideDateTime();
        while (entitlementGr.next()) {
            objectMap[entitlementGr.getUniqueValue()] = this._insertSubscriptionDetail(entitlementGr, calculatedOn);
        }

        return objectMap;
    },

    /**
     * Retrieves a mapping from subscription to subscription detail for the is_latest=true subscription detail records
     * 
     * @return {object} an object map of subscription_entitlement sysids to subscription_detail sysids
     */
    getSubscriptionDetailsMapByIsLatest: function() {
        const gr = new GlideRecord(this._detailTable);
        gr.addQuery('is_latest', true);
        gr.query();

        let map = {};
        while (gr.next()) {
            const key = gr.subscription || gr.license;
            const val = gr.getUniqueValue();
            map[key] = val;
        };
        return map;
    },

    /**
     * Creates a subscription_details record in the database from a subscription_entitlement record and returns the id of the created record
     *
     * @param {GlideRecord} the GlideRecord of the subscription_entitlement record to use in creating the subscription_detail record
     * @param {GlideDateTime} time to use for the records calculated_on field
     * @return {string} sysid of the inserted subscription_detail record
     */
    _insertSubscriptionDetail: function(entitlementGr, calculatedOn) {
        const detailGr = new GlideRecord(this._detailTable);
        detailGr.setValue('subscription_name', entitlementGr.getValue('name'));
        detailGr.setValue('subscription', entitlementGr.getUniqueValue());
        detailGr.setValue('calculated_on', calculatedOn);
        return detailGr.insert();
    },

    /**
     * Marks the set of subscription_detail records referenced in the object map of subscription_entitlement ids to subscription_detail ids
     *  as is_latest and processing_complete both to 'true'
     *
     * @param {object} an object map of subscription_entitlement sysids to subscription_detail sysids
     */
    completeSubscriptionDetails: function(map) {
        this._markOldDetailRecords();

        const detailGr = new GlideRecord(this._detailTable);
        const detailIds = Object.values(map);
        detailGr.addQuery("sys_id", "IN", detailIds);
        detailGr.query();
        detailGr.setValue('processing_complete', 'true');
        detailGr.setValue('is_latest', 'true');
        detailGr.updateMultiple();
    },

    /**
     * Marks old subscription_details records in the database as is_latest = false
     *
     */
    _markOldDetailRecords: function() {
        const detailGr = new GlideRecord(this._detailTable);
        detailGr.addQuery('is_latest', 'true');

        detailGr.query();
        detailGr.setValue('is_latest', 'false');
        detailGr.updateMultiple();
    },

    /**
     * Updates an existing subscription_details record in the database
     *
     * @param {object} the subscriptionDetail entry to update into the database
     */
    updateRecord: function(detailEntry) {
        const gr = new GlideRecord(this._detailTable);
        if (!gr.get(detailEntry.sysId)) {
            gs.warn(`Unable to find ${this._detailTable} entry with sys_id ${detailEntry.sysId} , aborting update.`);
            return;
        }

        gr.setValue("unconfirmed_user_count", detailEntry.unconfirmedUserCount);
        gr.setValue("allocated_user_count", detailEntry.allocatedUserCount);
        gr.setValue("unconfirmed_group_count", detailEntry.unconfirmedGroupCount);
        gr.setValue("allocated_user_without_licensable_role_count", detailEntry.allocatedUserWithoutLicensableRoleCount);
        gr.setValue("allocated_user_oob_count", detailEntry.allocatedUserOobCount);
        gr.setValue("unconfirmed_user_oob_count", detailEntry.unconfirmedUserOobCount);
        gr.setValue("licensable_group_count", detailEntry.licensableGroupCount);
        gr.setValue("licensable_group_subscribed_count", detailEntry.licensableGroupSubscribedCount);
        gr.setValue("allocated_quota_count", detailEntry.allocatedQuotaCount);
        gr.setValue("allocated_custom_table_count", detailEntry.allocatedCustomTableCount);
        gr.setValue("licensing_engine_version", detailEntry.licensingEngineVersion);

        gr.update();
    },

    /**
     * Gets an array of subscription_details records calculated_on times that are is_latest and in the list of {subscriptionEntitlements}
     *
     * @param {array} the subscription_entitlemtnt enties to find subscription_details entries for
     * @return {array} an array of created_on times for the selected subscription_detail records
     */
    getLatestSubscriptionDetailsCalculatedOnBySubscription: function(subscriptionEntitlements) {
        const sd = new GlideRecord(this._detailTable);
        sd.addQuery("subscription", "IN", subscriptionEntitlements);
        sd.addQuery("is_latest", "true");
        sd.query();
        const times = [];
        while (sd.next())
            times.push(sd.getValue("calculated_on"));

        return times;
    },

    type: 'dao_SubscriptionDetail'
};
