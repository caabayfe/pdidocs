var SubscriptionEntitlementDao = Class.create();
SubscriptionEntitlementDao.prototype = {
    METER_TYPE_MODULE: 'module',

    initialize: function() {},

    /**
     * Retrieves all of the active subscriptionIds (subscription_entitlement.sys_id)
     * That are of type Per-User
     *
     * @returns {array} An array of subscription_entitlement.sys_id values
     */
    getSubscriptionIdsByIsPerUser: function() {
        const now = new GlideDate().getValue();

        // Note: start_date & end_date values in the sample data are null. It is unclear if this will be the case
        //    in production, but adding support for it due to the test data.
        const gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.addQuery('start_date', '<=', now)
            .addOrCondition('start_date', 'NULL');
        gr.addQuery('subscription_type', 0); // Per-User
        gr.query();

        const ids = [];      
        while (gr.next())
            ids.push(gr.getUniqueValue());
        return ids;
    },

    /**
     * Retrieves the subscriptionId associated with the subscription detail record
     *
     * @param {guid} subscriptionDetailId The subscription_detail.sys_id of the record to query
     * @returns {guid} The subscription_entitlement.sys_id related to the record
     */
    getSubscriptionIdBySubscriptionDetailId: function(subscriptionDetailId) {
        const gr = new GlideRecord('subscription_detail');
        return gr.get(subscriptionDetailId) ?
            String(gr.getValue('subscription')) :
            null;
    },

    /**
     * Retrieves the subscriptionIds (subscription_entitlement.sys_id) belonging to a user that are
     * per-user type
     *
     * @param {guid} userId The sys_user.sys_id for the user to retrieve subscription information for
     * @returns {array} An array of subscription_entitlement.sys_id values the user is subscribed to
     */
    getSubscriptionIdsByUserIdAndIsPerUser: function(userId) {
        const now = new GlideDate().getValue();

        // Note: start_date & end_date values in the sample data are null. It is unclear if this will be the case
        //    in production, but adding support for it due to the test data.
        const gr = new GlideRecord('user_has_subscription');
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_STATUS, LicensingEngineDBConstants.ENTITLEMENT_STATUS.ACTIVE);
        gr.addQuery('subscription.start_date', '<=', now)
            .addOrCondition('subscription.start_date', 'NULL');
        gr.addQuery('subscription.end_date', '>=', now)
            .addOrCondition('subscription.end_date', 'NULL');
        gr.addQuery('user.sys_id', userId); // sys_user.sys_id
        gr.addQuery('subscription.subscription_type', 0); // Per-User
        gr.addActiveQuery();
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(String(gr.subscription.sys_id));
        return Array.from(ids);
    },

    /**
     * Retrieves the subscription_entitlement.sys_id belonging to the group
     * and are per-user
     *
     * @param {guid} groupId The sys_user_group.sys_id for the group to retrieve Active and Expired subscription information for
     * @returns {array} An array of subscription_entitlement.sys_id values the group is subscribed to
     */
    getSubscriptionIdsByGroupIdAndIsPerUser: function(groupId) {

        // Note: Removed query for start_date & end_date to support usage of Expired Subscription
        const gr = new GlideRecord('group_has_subscription');
        gr.addQuery('group.sys_id', groupId);
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.addQuery('subscription.subscription_type', 0); // Per-User
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(String(gr.subscription.sys_id));
        return Array.from(ids);
    },

    /**
     * Retrieves the subscriptionIds (subscription_entitlement.sys_id) belonging all active modules
     *
     * @returns {array} An array of subscription_entitlement.sys_id values the user is subscribed to
     */
    getSubscriptionIdsByIsModule: function() {
        const now = new GlideDate().getValue();

        // Note: start_date & end_date values in the sample data are null. It is unclear if this will be the case
        //    in production, but adding support for it due to the test data.
        const gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.addQuery('start_date', '<=', now)
            .addOrCondition('start_date', 'NULL');
        gr.addQuery('meter_type', this.METER_TYPE_MODULE);
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(gr.getUniqueValue());
        return Array.from(ids);
    },

    /**
     * Retrieves all of the active subscription ids that have a subscription type 
     * of unrestricted user.
     *
     * @returns {array} An array of subscription IDs
     */
    getSubscriptionIdsByActiveAndIsUnrestrictedUser: function() {
        const now = new GlideDate().getValue();

        const gr = new GlideRecord('subscription_entitlement');
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.ENTITLEMENT_STATUS.ACTIVE);
        gr.addQuery('start_date', '<=', now)
            .addOrCondition('start_date', 'NULL');
        gr.addQuery('end_date', '>=', now)
            .addOrCondition('end_date', 'NULL');
        gr.addQuery('subscription_type', 2); // 2 = Unrestricted User
        gr.query();

        const ids = [];
        while (gr.next())
            ids.push(gr.getUniqueValue());
        return ids;
    },

    /**
     * Return information about active subscriptions which contain specified app bundles
     * @param {array} appBundles names of app bundles
     * @return {array} an array of SubscriptionEntitlementData
     */
    getSubscriptionEntitlementsByContainsAppBundles: function(appBundles) {
        const gr = new GlideRecord('sku_metadata');
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        // look for app_bundle in column names
        gr.addQuery('schema.column_names', 'CONTAINS', 'app_bundle');

        // and look for app bundle values in column_values
        // note that a simple contains is used instead of matching a value at specific position
        // but this should be good enough given the columns are pretty different (VALIDATE)
        const condition = gr.addQuery('column_values', 'CONTAINS', appBundles[0]);
        for (let i = 1; i < appBundles.length; ++i) {
            condition.addOrCondition('column_values', 'CONTAINS', appBundles[i]);
        }
        gr.query();
        return this._distinct(this._collectRecords(gr, 'subscription'));
    },

    /**
     * Return information about id of ALL app bundles
     * @return {array} an array of ids of ALL app bundles 
     */
    getAppBundles: function() {
        const gr = new GlideRecord('sku_metadata');
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        // look for app_bundle in column names
        gr.addQuery('schema.column_names', 'CONTAINS', 'app_bundle');
        gr.query();

        var result = {};
        while (gr.next()) {
            // the last value in "column_values" column
            const column_schema = gr.getDisplayValue("schema");
            const column_values = gr.getValue("column_values");
            const columnSchemaArray = column_schema.split(",");
            const columnValueArray = column_values.split(",");
            if (columnSchemaArray.length > 0) {
                for (var i = 0; i < columnSchemaArray.length; i++) {
                    if (columnSchemaArray[i] == "app_bundle") {
                        result[columnValueArray[i]] = '1';
                    }
                }
            }
        }
        return Object.keys(result);
    },

    getSubscriptionRatiosByContainsAppBundles: function(appBundles, entitlementSysId) {
        const gr = new GlideRecord('sku_metadata');
        gr.addQuery('subscription.sys_id', entitlementSysId);
        const condition = gr.addQuery('column_values', 'CONTAINS', appBundles[0]);
        for (let i = 1; i < appBundles.length; ++i) {
            condition.addOrCondition('column_values', 'CONTAINS', appBundles[i]);
        }
        gr.query();


        var valueObjectArray = [];
        while (gr.next()) {
            const column_schema = gr.getDisplayValue("schema");
            const column_values = gr.getValue("column_values");
            const columnSchemaArray = column_schema.split(",");
            const columnValueArray = column_values.split(",");

            var valueObject = {};
            for (var i = 0; i < columnSchemaArray.length; i++) {
                valueObject[columnSchemaArray[i]] = columnValueArray[i];
            }
            valueObjectArray.push(valueObject);
        }
        return valueObjectArray;
    },

    _collectRecords: function(gr, columnName) {
        var result = [];
        while (gr.next()) {
            const record = columnName ? gr[columnName].getRefRecord() : gr;
            result.push(this._mapToObject(record));
        }
        return result;
    },

    _mapToObject: function(record) {
        var allocation_count = null;
        const detailsGr = new GlideRecord("subscription_detail");
        detailsGr.addQuery('subscription', record.getUniqueValue());
        detailsGr.addQuery('is_latest', 'true');
        detailsGr.query();
        if (detailsGr.next()) {
            allocation_count = detailsGr.allocated_quota_count.toString();
        }
        return SubscriptionEntitlementData.fromRecord(
            record.getUniqueValue(),
            record.name.toString(),
            record.start_date.toString(),
            record.end_date.toString(),
            record.purchased_count.toString(),
            allocation_count
        );
    },

    _distinct: function(licenseDetails) {
        const map = new Map();
        licenseDetails.forEach(obj => map.set(obj.id, obj));
        return Array.from(map.values());
    },

    /**
     * Retrieves all of the subscriptionIds (subscription_entitlement.sys_id) for list of products
     *
     * @returns {map} map of product and subscription_entitlement.sys_id
     */
    getProductCodeToEmsSubscriptionSysIdMap: function(productCodes) {
        const productCodeToEmsSubscriptionSysIdMap = {};

        if (global.LicensingScriptUtil.nil(productCodes))
            return productCodeToEmsSubscriptionSysIdMap;

        const gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.query();

        while (gr.next()) {
            const smv2ProductCode = gr.getValue('product_code');
            const smv2SubscriptionSysID = gr.getUniqueValue();

            for (let i = 0; i < productCodes.length; i++) {
                const smv1ProductCode = productCodes[i];
                if (this.isSubsetOf(smv1ProductCode, smv2ProductCode))
                    productCodeToEmsSubscriptionSysIdMap[smv1ProductCode] = smv2SubscriptionSysID;
            }
        }

        return productCodeToEmsSubscriptionSysIdMap;
    },

    /**
     * For the given SubscriptionId we return the ParentEntitlementId
     *
     * @param {guid} subscriptionId The subscription_entitlement.sys_id to retrieve subscription information
     * @returns {number} null or parentEntitlementId
     *
     * Note: Expectation is Customer will be mapping a Custom Table to a Primary Subscription and not the Secondary Meter
     */
    getParentEntitlementIdForCTSecondaryMeter: function(subscriptionId) {
        const entGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        entGR.addQuery(LicensingEngineDBConstants.SYS_ID, subscriptionId);
        entGR.addQuery(LicensingEngineDBConstants.SUBCLASS_TYPE, LicensingEngineConstants.CUSTOM_TABLES); // 'Custom Tables', filter only these we dont want to calculate counts for other secondary meters eg: Customer Portal Visits
        entGR.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK); 
        entGR.query();

        // If an entry is found return the parentEntitlementId, which is used to get the custom table count, since we are mapping tables at the Primary Subscription level
        return entGR.next() ?
            entGR.getValue(LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID) :
            null;
    },

    /**
     * For the given ParentEntitlementId return the list of all Secondary Meter (SubClassType: Custom Tables) to calculate
     * allocation count
     *
     * @param {guid} subscription_entitlement.parent_entitlement_id
     * @returns {GlideRecord} gr
     */
    getCTSecondaryMetersByParentEntitlementId: function(parentEntitlementId) {
        const entGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        entGR.addQuery(LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID, parentEntitlementId);
        entGR.addQuery(LicensingEngineDBConstants.ENTITLEMENT_TYPE, LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.SECONDARY_METER);
        entGR.addQuery(LicensingEngineDBConstants.SUBCLASS_TYPE, LicensingEngineConstants.CUSTOM_TABLES); // 'Custom Tables' filter only these we dont want to calculate counts for other secondary meters eg: Customer Portal Visits
        entGR.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        entGR.orderBy(LicensingEngineDBConstants.SYS_ID);
        entGR.query();

        return entGR;
    },

    /**
     * The method evaluates if product code(s) from SMV1 are subset of product code(s) from SMV2 product code(s) for a given license
     * 
     * @param {smv1ProductCode} of type string can be comma seperated to include multiple product code(s) from SMV1
     * @param {smv2ProductCode} of type string can be comma seperated to include multiple product code(s) from SMV2 
     * @returns {boolean} true if subset found else false
     * 
     * 
     * Example 1
     * var smv1ProductCode = "PROD12042,PROD120TEST,PROD1204";
     * var smv2ProductCode = "PROD12042,PROD12041";
     * isSubsetOf(smv1ProductCode, smv2ProductCode)  will return false
     * 
     * Example 2
     * var smv1ProductCode = "PROD12042,PROD45672";
     * var smv2ProductCode = "PROD120TEST,PROD12042,PROD45672";
     * isSubsetOf(smv1ProductCode, smv2ProductCode)  will return true
     * 
     * Example 3
     * var smv1ProductCode = "";
     * var smv2ProductCode = "PROD12042,PROD12041";
     * isSubsetOf(smv1ProductCode, smv2ProductCode)  will return false
     * 
     * Example 4
     * var smv1ProductCode = "PROD12042,PROD12041";
     * var smv2ProductCode = "";
     * isSubsetOf(smv1ProductCode, smv2ProductCode)  will return false
     * 
     * Example 5
     * var smv1ProductCode = "PROD12042,PROD12041";
     * var smv2ProductCode = "PROD12042,PROD12042,PROD12042";
     * isSubsetOf(smv1ProductCode, smv2ProductCode)  will return false
     * 
     */

    isSubsetOf: function(smv1ProductCode, smv2ProductCode) {
        if (global.LicensingScriptUtil.nil(smv1ProductCode) || global.LicensingScriptUtil.nil(smv2ProductCode))
            return false;

        const smv1ProductCodeList = smv1ProductCode.split(',').map(code => code.trim());
        const smv2ProductCodeList = smv2ProductCode.split(',').map(code => code.trim());

        if (smv1ProductCodeList.length > smv2ProductCodeList.length)
            return false;

        for (var i = 0; i < smv1ProductCodeList.length; i++) {
            if (!smv2ProductCodeList.includes(smv1ProductCodeList[i])) {
                return false;
            }

        }

        return true;
    },

    /**
     * Retrieves the capacity definition ID associated with a given subscription sys_id.
     * @param {string} subscriptionId - The sys_id of the subscription.
     * @returns {string|null} - The capacity definition ID if found, otherwise null.
     */
    getCapacityDefinitionIdBySubscriptionId: function(subscriptionId) {
        const entleGr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        if (entleGr.get(subscriptionId))
            return entleGr.getValue(LicensingEngineDBConstants.DEFINITION_ID);
        return null;
    },

    /**
     * Retrieves the array of active subscription entitlements created more than {daysAgo} days ago
     * @param {daysAgo} the number of daysold the record must be
     * @returns {array} - the array of found subscription entitlement sys_ids.
     */
    getActiveSubscriptionEntitlementsOlderThanDays: function(daysAgo = 2) {
        const se = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        se.addQuery("sys_created_on", "<", gs.daysAgo(daysAgo));
        se.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK); 
        se.query();
        const subscriptionEntitlements = [];
        while (se.next())
            subscriptionEntitlements.push(se.getUniqueValue());

        return subscriptionEntitlements;
    },

    /**
     * Return information about all active subscriptions for ITOM team to identify legacy itom licenses.
     * @return {array} an array of Subscription entitlement data
     */
    getSubscriptionEntitlementsITOM: function() {
        const subscriptionEntitlementObjList = [];
        const now = new GlideDate().getValue();
        const gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.addQuery('start_date', '<=', now);
        gr.addQuery('entitlement_type', 0); //process primary subscription only
        gr.query();
        while (gr.next()) {
            var subscriptionEntitlementObj = {
                'license': gr.getValue('name'),
                'product_code': gr.getValue('product_code'),
                'purchased_count': gr.getValue('purchased_count'),
                'details_url': "subscription_entitlement?sys_id=" + gr.sys_id
            };
            subscriptionEntitlementObjList.push(subscriptionEntitlementObj);
        }
        return subscriptionEntitlementObjList;
    },

    /**
     * 
     * @param {string} meterType meter_type value
     * @returns GlideRecord
     */
    getActiveSubscriptionIdsByMeterType: function(meterType) {
        const gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.addQuery("meter_type", meterType);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK); 
        gr.query();
        const ids = [];
        while (gr.next())
            ids.push(gr.getUniqueValue());

        return ids;
    },

    /**
     * 
     * @param {string} entitlementId entitlement_id value to retrieve the corresponding subscription_entitlement entry
     * @returns sysid of the subscription_entitlement entry in question or null if not found
     */
    getSubscriptionIdByEntitlementId: function(entitlementId) {
        const gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, entitlementId);
        gr.query();
        if (gr.next())
            return gr.getUniqueValue();

        return null;
    },

    getReferenceQueryFor_group_has_subscription: function() {
        // return query which include Active and Expired Entitlements to the Reference qual of group_has_subscription 
        // i.e. return 'statusIN0,2^subscription_typeIN0,2,3';

		// Build the subscription types part
        var subscriptionTypes = [
            LicensingEngineDBConstants.SUBSCRIPTION_TYPE_VALUE.PER_USER,
            LicensingEngineDBConstants.SUBSCRIPTION_TYPE_VALUE.UNRESTRICTED_USER,
            LicensingEngineDBConstants.SUBSCRIPTION_TYPE_VALUE.UNLIMITED_USER
        ].join(LicensingEngineDBConstants.COMMA);

        // Build the query using template literals
        var query = `${LicensingEngineDBConstants.STATUS}${LicensingEngineDBConstants.IN}${LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK}${LicensingEngineDBConstants.AND}${LicensingEngineDBConstants.SUBSCRIPTION_TYPE}${LicensingEngineDBConstants.IN}${subscriptionTypes}`;

        return query;
    },

    type: 'SubscriptionEntitlementDao'
};
