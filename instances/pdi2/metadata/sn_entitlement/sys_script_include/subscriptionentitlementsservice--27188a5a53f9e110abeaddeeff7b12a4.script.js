var SubscriptionEntitlementsService = Class.create();
SubscriptionEntitlementsService.prototype = {
    initialize: function() {
        this._cacheManager = new LicensingCacheManager();
        this._APIColumnList = [
            LicensingEngineDBConstants.NAME,
            LicensingEngineDBConstants.START_DATE,
            LicensingEngineDBConstants.END_DATE,
            LicensingEngineDBConstants.SUBSCRIPTION_TYPE,
            LicensingEngineDBConstants.MEASURED_ROLE_TYPES,
            LicensingEngineDBConstants.PRODUCT_CODE,
            LicensingEngineDBConstants.DEFINITION_ID,
            LicensingEngineDBConstants.PURCHASED_COUNT,
            LicensingEngineDBConstants.UNIT_OF_METER,
            LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID,
            LicensingEngineDBConstants.ENTITLEMENT_ID,
            LicensingEngineDBConstants.PACKAGE,
            LicensingEngineDBConstants.ACCELERATOR_SUB_CATALOGS,
            LicensingEngineDBConstants.ENTITLEMENT_MODEL,
            LicensingEngineDBConstants.PRODUCT_ACCESS_LEVEL,
            LicensingEngineDBConstants.STATUS,
            LicensingEngineDBConstants.PROPOSED_FIX,
            LicensingEngineDBConstants.PROGRAM_TYPE,
            LicensingEngineDBConstants.PRODUCT_FAMILY_3,
            LicensingEngineDBConstants.METER_TYPE
        ];
        this._tablesSchemaHelper = null;
        this.logger = new LoggingUtil();
        this.cacheDataHandler = new CacheDataHandler();
        // Family batch size for getAllActiveApplications(); bounds query and lookup-map size as the
        // catalog grows. Falls back to 500 when the property is non-numeric or <= 0, since
        // _forEachChunk() would loop forever on a non-positive size and drop all families on NaN.
        const configuredChunkSize = parseInt(gs.getProperty('sn_entitlement.get_all_active_applications.family_batch_size', '500'), 10);
        this._FAMILY_ID_QUERY_CHUNK_SIZE = (Number.isInteger(configuredChunkSize) && configuredChunkSize > 0) ? configuredChunkSize : 500;
    },

    _getTablesSchemaHelper: function() {
        if (this._tablesSchemaHelper === null)
            this._tablesSchemaHelper = new TablesSchemaHelper();
        return this._tablesSchemaHelper;
    },

    /**
     * Return information about all active subscriptions 
     * @return {array} an array of SubscriptionEntitlementData
     */
    getActiveSubscriptions: function() {
        return this._decorateWithURL(new LicenseDetailDaoV1().getLicenseDetailsByAllActive());
    },

    /**
     * Return information about active subscriptions which contain specified app bundles
     * @param {array} appBundles names of app bundles
     * @return {array} an array of SubscriptionEntitlementData
     */
    getSubscriptionsWithAppBundles: function(appBundles) {
        if (this._shouldUseNewSchema()) {
            const seDao = new SubscriptionEntitlementDao();
            if (global.LicensingScriptUtil.nil(appBundles) || appBundles.length == 0) {
                appBundles = seDao.getAppBundles();
            }
            return this._decorateWithURL(seDao.getSubscriptionEntitlementsByContainsAppBundles(appBundles), "subscription_entitlement", appBundles, seDao);
        } else {
            const ldDao = new LicenseDetailDaoV1();
            if (global.LicensingScriptUtil.nil(appBundles) || appBundles.length == 0) {
                appBundles = ldDao.getAppBundles();
            }
            return this._decorateWithURL(ldDao.getLicenseDetailsByContainsAppBundles(appBundles), "license_details", appBundles, ldDao);
        }
    },
    /**
     * Return information about all active subscriptions for ITOM team to identify legacy itom licenses.
     * @return {array} an array of Subscription data
     */
    getSubscriptionDetail: function() {
        if (this._shouldUseNewSchema()) {
            const seDao = new SubscriptionEntitlementDao();
            return seDao.getSubscriptionEntitlementsITOM();
        } else {
            const ldDao = new LicenseDetailDaoV1();
            return ldDao.getLicenseDetailsITOM();
        }
    },

    /**
     * Return GenAI metadata info of active subscriptions
     * @param {string} featureID
     * @return {string} string value of list of json objects with GenAI metadata details
     * example: [{ "feature_id": "Feature Id 8", "license_name": "Now Assist for ITSM", "feature": "Text to Code", "license_line_item_name": "Now Assist for ITSM", "assist": 0.5, "license_sys_id": "b4bfeabea8993110f877dbf9e380dafe" }, { "feature_id": "Feature Id 8", "license_name": "Now Assist for CSM", "feature": "Text to Code", "license_line_item_name": "Now Assist for CSM", "assist": 3, "license_sys_id": "d6ff6abea8993110f877dbf9e380da72" }]
     */
    getEntitledGenAIMetadataForFeature: function(featureID) {
        var response = '[]';

        if (global.LicensingScriptUtil.nil(featureID))
            return response;

        if (this._shouldUseNewSchema()) {
            var genAIMetadataObjList = [];

            var genAIMetadataFromCache = this.getMetadataFromCache(LicensingEngineDBConstants.GENAI_METADATA);
            if (global.LicensingScriptUtil.notNil(genAIMetadataFromCache) && !global.LicensingScriptUtil.isEmpty(genAIMetadataFromCache)) {
                for (var cacheMetadataObj of genAIMetadataFromCache) {
                    if (!cacheMetadataObj[LicensingEngineDBConstants.COLUMN_VALUES].includes(featureID))
                        continue;

                    var genAIMetadataObj = this._getFormattedMetadataObj(cacheMetadataObj);
                    if (global.LicensingScriptUtil.notNil(genAIMetadataObj) && genAIMetadataObj[LicensingEngineConstants.FEATURE_ID] == featureID) {
                        //assist ratio can be a fractional value (e.g. 0.5), so avoid truncating it
                        genAIMetadataObj[LicensingEngineConstants.ASSIST] = parseFloat(genAIMetadataObj[LicensingEngineConstants.ASSIST]);
                        genAIMetadataObjList.push(genAIMetadataObj);
                    }
                }
            }
            response = JSON.stringify(genAIMetadataObjList);
        } else
            response = sn_lef.GlideEntitlement.getEntitledGenAIMetadataInfo(featureID);

        return response;
    },

    /**
     * Return metadata info of active and expired subscriptions
     * @param {string} metadataType
     * @return {string} string representation of an array of JSON objects. Each JSON object has the following keys:
     * column_values,subscription.name,subscription.sys_id,schema.type: wdf_meter_ratio, schema.column_names,subscription_item.name,subscription_item.sys_id
     */
    getEntitledMetadataByType: function(metadataType) {
        return JSON.stringify(this.getMetadataFromCache(metadataType));
    },

    getMetadataFromCache: function(metadataType) {
        var metadataFromCache = [];

        // Use getter method with local copy pattern to avoid race condition
        // On cache miss: loads data locally, populates cache for other threads, returns local copy (immune to concurrent cache flush)
        var metadataTypeToObj = new SkuMetadataDAO().getSkuMetadata();

        if (!global.LicensingScriptUtil.nil(metadataTypeToObj)) {
            metadataTypeToObj.forEach(function(metadataObjList, columnKey) {
                if (!global.LicensingScriptUtil.nil(metadataType) && columnKey != metadataType)
                    return;

                metadataObjList.forEach(function(metadataObj) {
                    metadataFromCache.push(metadataObj);
                });

            });
        }

        return metadataFromCache;
    },

    /**
     * Return information about the routing to EMS or SURF APIs based on glide properties.
     */
    canRouteToEMS: function() {
        return this._shouldUseNewSchema();
    },

    /**
     * This is a helper function to change the format of metadata obj in cache to be suitable for licensing API
     * param cacheMetadataObj format = {"column_values":"Feature Id 8,Text to Code,2","subscription.name":"Now Assist for ITSM","subscription.sys_id":"b4bfeabea8993110f877dbf9e380dafe","schema.column_names":"feature_id,feature,assist"}
     * example returns (genai) metadata object in format = { "feature_id": "Feature Id 8", "license_name": "Now Assist for ITSM", "feature": "Text to Code", "license_line_item_name": "Now Assist for ITSM", "assist": "2", "license_sys_id": "b4bfeabea8993110f877dbf9e380dafe" }
     * applicable of any metadata type
     */
    _getFormattedMetadataObj: function(cacheMetadataObj) {

        if (global.LicensingScriptUtil.nil(cacheMetadataObj))
            return null;

        var metadataColumnValuesList = cacheMetadataObj[LicensingEngineDBConstants.COLUMN_VALUES].split(LicensingEngineConstants.COMMA);
        var metadataColumnNamesList = cacheMetadataObj[LicensingEngineDBConstants.SCHEMA_COLUMN_NAMES].split(LicensingEngineConstants.COMMA);
        var subscriptionName = cacheMetadataObj[LicensingEngineDBConstants.SUBSCRIPTION_NAME];

        if (metadataColumnNamesList.length > 0 && metadataColumnValuesList.length > 0 && metadataColumnNamesList.length == metadataColumnValuesList.length) {
            var metadataObj = {};
            for (var i = 0; i < metadataColumnNamesList.length; i++)
                metadataObj[metadataColumnNamesList[i]] = metadataColumnValuesList[i];

            metadataObj[LicensingEngineConstants.LICENSE_NAME] = subscriptionName;
            //since we don't have support for mapping between sku_metadata table and subscription line item, license_line_item_name will be same as name of subscription entitlement.
            metadataObj[LicensingEngineConstants.LICENSE_LINE_ITEM_NAME] = subscriptionName;
            metadataObj[LicensingEngineConstants.LICENSE_SYS_ID] = cacheMetadataObj[LicensingEngineDBConstants.SUBSCRIPTION_SYS_ID];

            return metadataObj;
        }

        return null;
    },

    _decorateWithURL: function(subscriptions, entitlementTableName, appBundles, entitlementDao) {
        subscriptions.forEach(record => record.details_url = entitlementTableName + '?sys_id=' + record.id);
        subscriptions.forEach(record => record.su_ratio = entitlementDao.getSubscriptionRatiosByContainsAppBundles(appBundles, record.id));
        subscriptions.forEach(record => record.app_bundle = record.su_ratio.length > 0 ? record.su_ratio[0].app_bundle : null);
        return subscriptions;
    },

    _shouldUseNewSchema: function() {
        const surfRouting = gs.getProperty('glide.entitlement.surf.routing', true).toLowerCase() === 'true';
        const emsDataAvailable = gs.getProperty('glide.entitlement.ems.data.available', false).toLowerCase() === 'true';
        return !surfRouting && emsDataAvailable;
    },

    getPoolLicense: function(accrualPeriod, mode) {
        if (global.LicensingScriptUtil.nil(mode))
            mode = LicensingEngineConstants.GRACE_MODE; //default mode is GRACE
        if (mode === LicensingEngineConstants.STRICT_MODE && global.LicensingScriptUtil.nil(accrualPeriod))
            return null;

        const subscriptionList = this.getEntitlementDetails(LicensingEngineConstants.INTEGRATIONHUBPOOL);
        if (subscriptionList.length < 1)
            return null;

        for (let subscription of subscriptionList) {
            if (mode === LicensingEngineConstants.GRACE_MODE)
                return LicensingEngineConstants.INTEGRATIONHUBPOOL;

            if (mode === LicensingEngineConstants.STRICT_MODE && this.isValidForAccrualPeriod(subscription.start_date, subscription.end_date, accrualPeriod))
                return LicensingEngineConstants.INTEGRATIONHUBPOOL;
        }
        return null;
    },

    isValidForAccrualPeriod: function(startDate, endDate, accrualPeriod) {
        if (global.LicensingScriptUtil.nil(accrualPeriod))
            return false;

        startDate = new GlideDateTime(startDate);
        endDate = new GlideDateTime(endDate);
        accrualPeriod = new GlideDateTime(accrualPeriod);
        endDate.addDaysLocalTime(LicensingEngineConstants.GRACE_PERIOD_DAYS);

        if (accrualPeriod >= startDate && accrualPeriod <= endDate)
            return true;
        return false;
    },

    getEntitlementDetails: function(subscriptionIdentifier) {
        let subscriptionList = [];
        let entitlmentIdToSubscriptionObj = this._loadSubscriptionEntitlementFromCache();
        if (!global.LicensingScriptUtil.nil(entitlmentIdToSubscriptionObj) && entitlmentIdToSubscriptionObj.size !== 0) {
            for (let [entitlementId, subscriptionObjectList] of entitlmentIdToSubscriptionObj) {
                for (let subscriptionObject of subscriptionObjectList) {
                    const subscriptionID = subscriptionObject[LicensingEngineDBConstants.SUBSCRIPTION_IDENTIFIER];
                    if (global.LicensingScriptUtil.notNil(subscriptionID) && subscriptionID === subscriptionIdentifier)
                        subscriptionList.push(subscriptionObject);
                }
            }
        }
        return subscriptionList;
    },

    /**
     * Return information about all active subscriptions
     * @return {string} string value of list of JSON objects. Each JSON object has the following keys:
     * name, start_date, end_date, subscription_type, measured_role_types, product_code, purchased_count, definition_id
     */
    getAllActiveEntitlements: function() {
        const start = Date.now();
        let entitlements = [];
        let entitlmentIdToSubscriptionObj = this._loadSubscriptionEntitlementFromCache();
        if (!global.LicensingScriptUtil.nil(entitlmentIdToSubscriptionObj) && entitlmentIdToSubscriptionObj.size !== 0) {
            for (let [entitlementId, subscriptionObjectList] of entitlmentIdToSubscriptionObj) {
                if (gs.nil(entitlementId))
                    continue;

                for (let subscriptionObject of subscriptionObjectList) {
                    const entitlementObj = {};
                    this._APIColumnList.forEach(col => entitlementObj[col] = subscriptionObject[col] !== undefined ? subscriptionObject[col] : "");

                    const isVisible = subscriptionObject.hasOwnProperty('display_type') && subscriptionObject.display_type !== LicensingEngineDBConstants.FAMILY_DISPLAY_TYPE.HIDE;
                    const isNotAssist = gs.nil(subscriptionObject.meter_type) || subscriptionObject.meter_type !== 'Assist';
                    const isPrimaryOrSecondary = gs.nil(subscriptionObject.entitlement_type) ||
                        subscriptionObject.entitlement_type == LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.PRIMARY_SUBSCRIPTION ||
                        subscriptionObject.entitlement_type == LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.SECONDARY_SUBSCRIPTION;

                    if (isVisible && isNotAssist && isPrimaryOrSecondary) {
                        entitlementObj[LicensingEngineDBConstants.ADDITIONAL_DETAILS] =
                            "/now/subscription/subscription-details/" + subscriptionObject.sys_id + "/regularuser";
                    }

                    entitlements.push(entitlementObj);
                }
            }
        }
        return JSON.stringify(entitlements);
    },

	_loadSubscriptionEntitlementFromCache: function() {
	    // Use getter method with local copy pattern to avoid race condition
	    // On cache miss: loads data locally, populates cache for other threads, returns local copy (immune to concurrent cache flush)
	    return new SubscriptionEntitlementDAO().getSubscriptionEntitlements();
	},
	
    /**
     * Return GenAI Now Assist usage info of the customer account
     * @return json objects with GenAI Now Assist usage details
     * example: {"account_number":"ACC0012","total_assist_purchased_count":2600000,"total_assist_used_count":1070000}
     */
    getNowAssistSKUUsageInfo: function() {
        var response = {};
        var totalPurchased = 0;
        var accountNumber = "";
        var totalUsed = 0;
        let accrualTime = "";

        //get total purchased count for now assist
        const gr = new GlideRecord(LicensingEngineDBConstants.ACCOUNT_NOWASSIST_PURCHASED);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, [LicensingEngineDBConstants.ACTIVE, LicensingEngineDBConstants.EXPIRED]);
        gr.query();

        while (gr.next()) {
            if (global.LicensingScriptUtil.nil(accountNumber))
                accountNumber = gr.getValue(LicensingEngineDBConstants.ACCOUNT_NUMBER);

            var purchased = gr.getValue(LicensingEngineDBConstants.PURCHASED_COUNT);
            if (global.LicensingScriptUtil.notNil(purchased))
                totalPurchased += parseInt(purchased);
        }
        response[LicensingEngineDBConstants.ACCOUNT_NUMBER] = accountNumber; //nice to have
        response[LicensingEngineConstants.TOTAL_ASSIST_PURCHASED_COUNT] = totalPurchased;

        //get total now assist used count for the account
        const rec = new GlideRecord(LicensingEngineDBConstants.SN_ENTITLEMENT_GENAI_ASSIST_COUNTS);
        rec.addQuery(LicensingEngineDBConstants.AGGREGATION_TYPE, LicensingEngineConstants.ACCOUNT); //this condition in this table indicates the account level counts
        rec.query();
        if (rec.next()) {
            totalUsed = global.LicensingScriptUtil.notNil(rec.getValue(LicensingEngineDBConstants.TOTAL_ASSISTS)) ? parseInt(rec.getValue(LicensingEngineDBConstants.TOTAL_ASSISTS)) : 0;
            accrualTime = rec.getValue(LicensingEngineDBConstants.ACCRUAL_TIME);
        }

        response[LicensingEngineConstants.TOTAL_ASSIST_USED_COUNT] = totalUsed;
        response[LicensingEngineConstants.ACCRUAL_TIME] = accrualTime;

        return response;
    },

    /**
     * Return GenAI Creator usage info of the customer account
     * @return json objects with GenAI Creator usage details
     * example: {"account_number":"ACC0012","total_creator_purchased_count":2600000,"total_creator_user_count":1070000,"total_unconfirmed_creator_user_count": 400}
     */
    getGenAICreatorSKUUsageInfo: function() {
        var response = {};
        var totalPurchased = 0;
        var totalUserCount = 0;
        var totalUnconfirmedCount = 0;

        //get total purchased count for GenAI creator
        const gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.addQuery(LicensingEngineDBConstants.METER_TYPE, LicensingEngineConstants.CREATOR);
        gr.query();
        while (gr.next()) {
            var purchased = gr.getValue(LicensingEngineDBConstants.PURCHASED_COUNT);
            if (global.LicensingScriptUtil.notNil(purchased))
                totalPurchased += parseInt(purchased);
        }
        response[LicensingEngineConstants.TOTAL_CREATOR_PURCHASED_COUNT] = totalPurchased;

        //get total confirmed and unconfirmed user count for GenAI creator
        const rec = new GlideRecord(LicensingEngineDBConstants.SN_ENTITLEMENT_GENAI_CREATOR_USER_COUNTS);
        rec.addQuery(LicensingEngineDBConstants.AGGREGATION_TYPE, LicensingEngineConstants.ACCOUNT); //this condition in this table indicates the account level counts
        rec.query();
        if (rec.next()) {
            totalUserCount = global.LicensingScriptUtil.notNil(rec.getValue(LicensingEngineDBConstants.TOTAL_CONFIRMED)) ? parseInt(rec.getValue(LicensingEngineDBConstants.TOTAL_CONFIRMED)) : 0;
            totalUnconfirmedCount = global.LicensingScriptUtil.notNil(rec.getValue(LicensingEngineDBConstants.TOTAL_UNCONFIRMED)) ? parseInt(rec.getValue(LicensingEngineDBConstants.TOTAL_UNCONFIRMED)) : 0;
        }
        response[LicensingEngineConstants.TOTAL_CREATOR_USER_COUNT] = totalUserCount;
        response[LicensingEngineConstants.TOTAL_UNCONFIRMED_CREATOR_USER_COUNT] = totalUnconfirmedCount;

        //get account number
        const accountNumber = this.getInstanceAccountNumber();
        if (global.LicensingScriptUtil.nil(accountNumber)) {
            this.logger.logInfo(this.type, 'getGenAICreatorSKUUsageInfo', "The account number hasn't been set in sn_mif_instance table yet");
            response[LicensingEngineDBConstants.ACCOUNT_NUMBER] = '';
        } else
            response[LicensingEngineDBConstants.ACCOUNT_NUMBER] = accountNumber;

        return response;
    },

    getInstanceAccountNumber: function() {
        if (!this._getTablesSchemaHelper().isvalidTable(LicensingEngineConstants.SN_MIF_INSTANCE)) {
            this.logger.logInfo(this.type, 'getInstanceAccountNumber', "The table sn_mif_instance doesn't exist");
            return '';
        }

        const instanceID = gs.getProperty(LicensingEngineConstants.INSTANCE_ID);
        const gr = new GlideRecord(LicensingEngineConstants.SN_MIF_INSTANCE);
        gr.addQuery(LicensingEngineConstants.INSTANCE_ID, instanceID);
        gr.query();
        if (gr.next())
            return gr.getValue(LicensingEngineConstants.ACCOUNT_ID);

        return '';
    },

    /**
     * Returns information about all applications and plugins from the active subscriptions
     * @return list of JSON objects. Each JSON object has the following keys:
     * app_id, app_name, exclusion_type, plugin_id, plugin_name
     */
    getAllActiveApplications: function() {
        const start = Date.now();
        // Step 1: find the distinct active (family, displayType) groups - single query, same as before.
        const groups = [];
        const gr = new GlideAggregate(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION + LicensingEngineConstants.DOT + LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.groupBy(LicensingEngineDBConstants.LICENSE_FAMILY);
        gr.groupBy(LicensingEngineDBConstants.DISPLAY_TYPE);
        gr.query();
        while (gr.next()) {
            const famID = gr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_FAMILY);
            const famName = gr.getDisplayValue(LicensingEngineDBConstants.SUBSCRIPTION_FAMILY);
            const displayType = gr.getValue(LicensingEngineDBConstants.DISPLAY_TYPE);

            if (global.LicensingScriptUtil.nil(famID) || global.LicensingScriptUtil.nil(famName))
                continue;

            groups.push({ famID: famID, famName: famName, displayType: displayType });
        }

        // Step 2: process families in bounded batches instead of one query per family (N+1) or one
        // query for the whole catalog (unbounded memory). Each batch's lookup maps are built and
        // dropped before the next batch runs, keeping peak memory proportional to one batch.
        const applications = [];
        this._forEachChunk(groups, this._FAMILY_ID_QUERY_CHUNK_SIZE, function(groupChunk) {
            const famIDChunk = groupChunk.map(function(group) { return group.famID; });
            const subscriptionsByFamily = this._loadSubscriptionsByFamily(famIDChunk);
            const pluginsByLineage = this._loadUAAppFamiliesByLineage(famIDChunk);

            groupChunk.forEach(function(group) {
                const exclusionType = group.displayType in LicensingEngineConstants.EMS_EXCLUSION_TYPE ?
                    LicensingEngineConstants.EMS_EXCLUSION_TYPE[group.displayType] : "none";
                const subscriptionData = subscriptionsByFamily.get(this._familyDisplayTypeKey(group.famID, group.displayType)) || [];
                const pluginRows = pluginsByLineage.get(group.famID) || [];

                //families without plugins will also be part of the list with empty plugin info
                if (pluginRows.length === 0) {
                    applications.push(this._buildApplicationObj(group.famID, group.famName, exclusionType, "", "", subscriptionData));
                    return;
                }

                pluginRows.forEach(function(plugin) {
                    applications.push(this._buildApplicationObj(group.famID, group.famName, exclusionType, plugin.appId, plugin.appName, subscriptionData));
                }, this);
            }, this);
        }, this);

        this.logger.logInfo(this.type, 'getAllActiveApplications', `getAllActiveApplications finished, elapsed time(ms) : ${Date.now() - start}`);
        return applications;
    },

    _buildApplicationObj: function(famID, famName, exclusionType, pluginId, pluginName, subscriptionData) {
        const obj = {};
        obj[LicensingEngineDBConstants.APP_ID] = famID;
        obj[LicensingEngineDBConstants.APP_NAME] = famName;
        obj[LicensingEngineConstants.EXCLUSION_TYPE] = exclusionType;
        obj[LicensingEngineConstants.PLUGIN_ID] = pluginId;
        obj[LicensingEngineConstants.PLUGIN_NAME] = pluginName;
        obj[LicensingEngineDBConstants.SUBSCRIPTION] = subscriptionData;
        return obj;
    },

    _familyDisplayTypeKey: function(famID, displayType) {
        return famID + '|' + displayType;
    },

    /**
     * Loads subscription number/name pairs for the given famIDs in a single query (callers are expected
     * to pass at most _FAMILY_ID_QUERY_CHUNK_SIZE ids at a time, per the batching in
     * getAllActiveApplications()).
     * @return {Map} keyed by _familyDisplayTypeKey(famID, displayType) -> array of {number, name}
     */
    _loadSubscriptionsByFamily: function(famIDs) {
        const subscriptionsByFamily = new Map();
        if (famIDs.length === 0)
            return subscriptionsByFamily;

        const subscriptionGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
        subscriptionGR.addJoinQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT, LicensingEngineDBConstants.SUBSCRIPTION, LicensingEngineDBConstants.ENTITLEMENT_ID);
        subscriptionGR.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_FAMILY, LicensingEngineDBConstants.IN, famIDs);
        // Re-applies the Step 1 status filter, so a family with both active and inactive
        // subscriptions only lists the active ones.
        subscriptionGR.addQuery(LicensingEngineDBConstants.SUBSCRIPTION + LicensingEngineConstants.DOT + LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        subscriptionGR.query();
        while (subscriptionGR.next()) {
            const key = this._familyDisplayTypeKey(subscriptionGR.getValue(LicensingEngineDBConstants.SUBSCRIPTION_FAMILY), subscriptionGR.getValue(LicensingEngineDBConstants.DISPLAY_TYPE));
            if (!subscriptionsByFamily.has(key))
                subscriptionsByFamily.set(key, []);
            subscriptionsByFamily.get(key).push({
                "number": subscriptionGR.subscription.product_code.toString(),
                "name": subscriptionGR.getDisplayValue('subscription')
            });
        }
        return subscriptionsByFamily;
    },

    /**
     * Loads ua_app_family plugin rows for the given famIDs in a single query (callers are expected to
     * pass at most _FAMILY_ID_QUERY_CHUNK_SIZE ids at a time, per the batching in
     * getAllActiveApplications()).
     * @return {Map} keyed by lineage_id -> array of {appId, appName}
     */
    _loadUAAppFamiliesByLineage: function(famIDs) {
        const pluginsByLineage = new Map();
        if (famIDs.length === 0)
            return pluginsByLineage;

        const uaAppFamGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_FAMILY);
        uaAppFamGR.addQuery(LicensingEngineDBConstants.LINEAGE_ID, LicensingEngineDBConstants.IN, famIDs);
        uaAppFamGR.query();
        while (uaAppFamGR.next()) {
            // Keyed on lineage_id alone, not name: ua_app_family.lineage_name is a denormalized snapshot
            // that can drift from license_family's current name, and requiring a name match would drop
            // rows for renamed families.
            const key = uaAppFamGR.getValue(LicensingEngineDBConstants.LINEAGE_ID);
            if (!pluginsByLineage.has(key))
                pluginsByLineage.set(key, []);
            pluginsByLineage.get(key).push({
                appId: uaAppFamGR.getValue(LicensingEngineDBConstants.APP_ID),
                appName: uaAppFamGR.getValue(LicensingEngineDBConstants.APP_NAME)
            });
        }
        return pluginsByLineage;
    },

    _forEachChunk: function(items, chunkSize, callback, thisArg) {
        for (let i = 0; i < items.length; i += chunkSize)
            callback.call(thisArg, items.slice(i, i + chunkSize));
    },

    getAllMDMProducts: function() {
        var response = [];
        // Use getter method with local copy pattern to avoid race condition
        // On cache miss: loads data locally, populates cache for other threads, returns local copy (immune to concurrent cache flush)
        var globalConfigData = new MDMProductDataDAO().getGlobalConfigData();


        if (global.LicensingScriptUtil.nil(globalConfigData))
            return JSON.stringify(response);

        for (var [configType, productSet] of globalConfigData) {
            for (var product of productSet) {
                var productObj = {};
                productObj[LicensingEngineConstants.CONFIG_TYPE] = configType;
                productObj[LicensingEngineConstants.PRODUCT_CODE] = product[LicensingEngineConstants.PRODUCT_CODE];
                var productData = product[LicensingEngineConstants.DATA];
                productObj[LicensingEngineConstants.DATA] = JSON.parse(productData);
                response.push(productObj);
            }
        }

        return JSON.stringify(response);
    },

    getAllValidEMSEntitlements: function() {
        var response = [];
        // Use getter method with local copy pattern to avoid race condition
        // On cache miss: loads data locally, populates cache for other threads, returns local copy (immune to concurrent cache flush)
        var entitlementData = new SubscriptionEntitlementItemDAO().getSubscriptionEntitlementItems();

        if (global.LicensingScriptUtil.nil(entitlementData))
            return JSON.stringify(response);

        for (var [key, entitlementSet] of entitlementData) {
            for (var entitlementObj of entitlementSet) {
                response.push(entitlementObj);
            }
        }

        return JSON.stringify(response);
    },

    type: 'SubscriptionEntitlementsService'
};
