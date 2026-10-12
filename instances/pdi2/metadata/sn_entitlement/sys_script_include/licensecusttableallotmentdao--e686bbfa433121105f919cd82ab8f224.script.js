var LicenseCustTableAllotmentDAO = Class.create();
LicenseCustTableAllotmentDAO.prototype = {
    initialize: function() {
        this._logger = new LoggingUtil();
        this._entitlementUtils = new sn_lef.EntitlementEngineUtils();
        this._grHelper = new sn_entitlement.LicensingEngineGlideRecordHelper();
        this.subscriptionAllotmentMap = new Map();
    },

    insertOrUpdate: function(subEntSysId, numberOfTables, allotmentType) {
        const migrationCompleted = this._entitlementUtils.getEntitlementEnginePropValue(LicensingEngineConstants.PROP_SM_CUSTOMER_INSTANCE_MIGRATED);
        if (!global.LicensingScriptUtil.toBoolean(migrationCompleted)) {
            const subEntGr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            if (!subEntGr.get(subEntSysId)) {
                // not present, shouldn't happen
                return;
            }
            const smV2ProdCode = subEntGr.getValue(LicensingEngineDBConstants.PRODUCT_CODE);
            const custAllotGR = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
            custAllotGR.addQuery(LicensingEngineDBConstants.LICENSE.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.PRODUCT_CODE), smV2ProdCode);
            custAllotGR.query();

            // SMV1 Mapping exists for product code, use the count coming as part of SMV2
            if (custAllotGR.next() && custAllotGR.getValue(LicensingEngineDBConstants.ALLOTMENT_TYPE) == allotmentType) {
                custAllotGR.setValue(LicensingEngineDBConstants.NUMBER_OF_TABLES, numberOfTables);
                custAllotGR.update();
                return;
            }
        }

        let doInsert = true;
        const gr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT, subEntSysId);
        gr.query();
        if (gr.next()) {
            doInsert = false;
        } else {
            gr.initialize();
            gr.setValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT, subEntSysId);
        }

        gr.setValue(LicensingEngineDBConstants.NUMBER_OF_TABLES, numberOfTables);
        gr.setValue(LicensingEngineDBConstants.ALLOTMENT_TYPE, allotmentType);

        if (doInsert)
            gr.insert();
        else
            gr.update();
    },

    /**
     * Used in data migration for mapping license_details reference to subscription_entitlement
     * Load all product_code from license_cust_table_allotment.license
     *
     * @returns {object} returns the product_code to license_details.sys_id map
     */
    getLicenseProductCodesToSysIdsMap: function() {
        const productCodeToLicenseObj = {};
        const gr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        gr.addNotNullQuery(LicensingEngineDBConstants.LICENSE);
        gr.query();

        while (gr.next()) {
            let licenseSysId = gr.getValue(LicensingEngineDBConstants.LICENSE);
            let allotmentType = gr.getValue(LicensingEngineDBConstants.ALLOTMENT_TYPE);
            let productCode = gr.getElement(LicensingEngineDBConstants.LICENSE.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.PRODUCT_CODE));
            let expiredStatus = gr.getElement(LicensingEngineDBConstants.LICENSE.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.EXPIRED));
            if (global.LicensingScriptUtil.nil(productCode)) // In case!!!
                continue;

            productCodeToLicenseObj[productCode] = {
                'licenseCustTblAllotSysId': gr.getUniqueValue(),
                'licenseSysId': licenseSysId,
                'allotmentType': allotmentType,
                'expiredStatus': expiredStatus
            };
        }

        return productCodeToLicenseObj;
    },

    /**
     * Update subscription_entitlement reference in license_cust_table_allotment.
     *
     * @param {guid} sysId of license_cust_table_allotment
     * @param {guid} subEntSysId sysId of subscription_entitlement
     *
     * @returns {boolean} if the subscription_entitlement is of Grandfather Allotment type it returns true otherwise false
     */
    updateSubscriptionEntitlementReference: function(licenseCustTblAllotSysId, subEntSysId) {
        const gr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        if (!gr.get(licenseCustTblAllotSysId)) {
            this._logger.logInfo(this.type, "updateSubscriptionEntitlementReference", 'Record not found to update: ' + licenseCustTblAllotSysId);
            return false;
        }
        //number of tables is unlimited in v2 if it is empty in v1
        if (gr.getValue(LicensingEngineDBConstants.NUMBER_OF_TABLES) == null) {
            gr.setValue(LicensingEngineDBConstants.NUMBER_OF_TABLES, '999999999');
        }
        gr.setValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT, subEntSysId);
        gr.update();

        return gr.getValue(LicensingEngineDBConstants.ALLOTMENT_TYPE) == LicensingEngineDBConstants.ALLOTMENT_TYPE_GRANDFATHER;
    },

    /**
     * license_cust_table_allotment contains only the records for Subscriptions (Primary Subscription) which have Custom Tables
     *
     * @returns {object} of subscription_entitlement.entitlement_id and subscription_entitlement.sys_id
     */
    getEntitlementToSubscriptionMap: function() {
        const entIdToSubscriptionIdMap = {};
        const gr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        gr.addNotNullQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.query();

        const entitlementId = LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.ENTITLEMENT_ID);
        while (gr.next())
            entIdToSubscriptionIdMap[gr.getElement(entitlementId)] = gr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);

        return entIdToSubscriptionIdMap;
    },

    /**
     * license_cust_table_allotment contains only the records for Subscriptions (Primary Subscription) which have Custom Tables
     *
     * @returns {object} of subscription_entitlement.entitlement_id and subscription_entitlement.name
     */
    getEntitlementToSubscriptionNamesMap: function() {
        const entIdToSubscriptionIdMap = {};

        const gr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        gr.addNotNullQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        this._grHelper.addExtraField(gr, `${LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT}.${LicensingEngineDBConstants.ENTITLEMENT_ID}`);
        this._grHelper.addExtraField(gr, `${LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT}.${LicensingEngineDBConstants.NAME}`);
        gr.query();

        while (gr.next()) {
            const entitlementId = gr[LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT][LicensingEngineDBConstants.ENTITLEMENT_ID].toString();
            const subscriptionName = gr[LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT][LicensingEngineDBConstants.NAME].toString();
            entIdToSubscriptionIdMap[entitlementId] = subscriptionName;
        }

        return entIdToSubscriptionIdMap;
    },

    /**
     * returns the grand father subscription details if exists
     */
    getGrandFatherSubscriptionDetails: function() {
        const ENTITLEMENT_STATUS = LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
        const licCustTblAllotmentGr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        licCustTblAllotmentGr.addQuery(LicensingEngineDBConstants.ALLOTMENT_TYPE, LicensingEngineDBConstants.ALLOTMENT_TYPE_GRANDFATHER);
        licCustTblAllotmentGr.addNotNullQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        if (this._isExpiredEntitlementMappingEnabled()) {
            // Allow both ACTIVE and EXPIRED statuses
            licCustTblAllotmentGr.addQuery(ENTITLEMENT_STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        } else {
            // Allow only ACTIVE
            licCustTblAllotmentGr.addQuery(ENTITLEMENT_STATUS, LicensingEngineDBConstants.ENTITLEMENT_STATUS.ACTIVE);
        }
        licCustTblAllotmentGr.query();
        if (licCustTblAllotmentGr.next()) {
            return {
                licenseSysId: licCustTblAllotmentGr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT),
                numTables: licCustTblAllotmentGr.getValue(LicensingEngineDBConstants.NUMBER_OF_TABLES)
            };
        }
    },

    /**
     * returns all grand father subscription names.
     */
    getAllGrandFatherSubscriptionByName: function() {
        const licCustTblAllotmentGr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        licCustTblAllotmentGr.addQuery(LicensingEngineDBConstants.ALLOTMENT_TYPE, LicensingEngineDBConstants.ALLOTMENT_TYPE_GRANDFATHER);
        licCustTblAllotmentGr.addNotNullQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        licCustTblAllotmentGr.query();

        const grandfatherSubscriptions = {};

        while (licCustTblAllotmentGr.next()) {
            const name = licCustTblAllotmentGr.getDisplayValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            const licenseSysId = licCustTblAllotmentGr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT)
            grandfatherSubscriptions[name] = licenseSysId;
        }

        return grandfatherSubscriptions;
    },

    /**
     * get active subsctiptions by allotment type
     */
    getActiveSubscriptionsByAllotmentType: function(allotmentType) {
        const ENTITLEMENT_STATUS = LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
        const licCustTblAllotmentGr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        licCustTblAllotmentGr.addQuery(LicensingEngineDBConstants.ALLOTMENT_TYPE, allotmentType);
        licCustTblAllotmentGr.addNotNullQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        if (this._isExpiredEntitlementMappingEnabled()) {
            // Allow both ACTIVE and EXPIRED statuses
            licCustTblAllotmentGr.addQuery(ENTITLEMENT_STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        } else {
            // Allow only ACTIVE
            licCustTblAllotmentGr.addQuery(ENTITLEMENT_STATUS, LicensingEngineDBConstants.ENTITLEMENT_STATUS.ACTIVE);
        }
        licCustTblAllotmentGr.query();

        const result = [];
        while (licCustTblAllotmentGr.next()) {
            const subscription = {};
            subscription.subscriptionName = licCustTblAllotmentGr.getDisplayValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            subscription.subscriptionEntitlementId = licCustTblAllotmentGr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            subscription.numTables = licCustTblAllotmentGr.getValue(LicensingEngineDBConstants.NUMBER_OF_TABLES);
            result.push(subscription);
        }
        return result;
    },

    /**
     * get all active primary subscriptions
     */
    getAllActivePrimarySubscriptions: function() {
        const ENTITLEMENT_STATUS = LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
        const licCustTblAllotmentGr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        licCustTblAllotmentGr.addNotNullQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        if (this._isExpiredEntitlementMappingEnabled()) {
            // Allow both ACTIVE and EXPIRED statuses
            licCustTblAllotmentGr.addQuery(ENTITLEMENT_STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        } else {
            // Allow only ACTIVE
            licCustTblAllotmentGr.addQuery(ENTITLEMENT_STATUS, LicensingEngineDBConstants.ENTITLEMENT_STATUS.ACTIVE);
        }
        licCustTblAllotmentGr.query();

        const result = [];
        while (licCustTblAllotmentGr.next()) {
            const subscription = {};
            subscription.subscriptionName = licCustTblAllotmentGr.getDisplayValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            subscription.subscriptionEntitlementId = licCustTblAllotmentGr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            result.push(subscription);
        }
        return result;
    },

    getAllotmentTypeBySubscriptionSysId: function(sysId) {
        if (!this.subscriptionAllotmentMap.size)
            this.loadSubscriptionAllotmentMap();

        const allotmentType = this.subscriptionAllotmentMap.get(sysId);
        if (global.JSUtil.nil(allotmentType))
            return null;
        return allotmentType;
    },

    loadSubscriptionAllotmentMap: function() {
        const licCustTblAllotmentGr = new GlideRecord(LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT);
        licCustTblAllotmentGr.query();
        while (licCustTblAllotmentGr.next()) {
            const subSysid = licCustTblAllotmentGr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            if (global.JSUtil.notNil(subSysid))
                this.subscriptionAllotmentMap.set(subSysid, licCustTblAllotmentGr.getValue(LicensingEngineDBConstants.ALLOTMENT_TYPE));
        }
    },

    /**
     * @description Checks the system property to decide if expired subscriptions
     * should be included in entitlement queries.
     *
     * @returns {Boolean} True if expired entitlements should be included, false otherwise.
     */
    _isExpiredEntitlementMappingEnabled: function() {
        var propValue = gs.getProperty(
            LicensingEngineConstants.PROP_GLIDE_EXPIRED_ENTITLEMENT_MAPPING_ENABLED,
            'false' // default as string
        );
        return propValue && propValue.toLowerCase() === 'true';
    },

    type: 'LicenseCustTableAllotmentDAO'
};
