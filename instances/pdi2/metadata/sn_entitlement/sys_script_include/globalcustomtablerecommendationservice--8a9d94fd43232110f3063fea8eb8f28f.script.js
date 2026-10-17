var GlobalCustomTableRecommendationService = Class.create();
GlobalCustomTableRecommendationService.prototype = {
    initialize: function() {
        this._logger = new LoggingUtil();
        this._customTableInventoryDAO = new CustomTableInventoryDAO();
        this._tablesSchemaHelper = new TablesSchemaHelper();
        this._globalCustomTablesRecommendationDAO = new GlobalCustomTablesRecommendationDAO();
        this._grandfatherLicenseHelper = new GrandfatherLicenseHelper();
        this._subscriptionHasFamilyDAO = new SubscriptionHasFamilyDAO();
        this._licenseCustTableAllotmentDAO = new LicenseCustTableAllotmentDAO();
        this._table_to_subscription_map = {};
        this.MAX_RECOMMENDATIONS = gs.getProperty('sn_entitlement.max_recommendations_for_unallocated_global_custom_tables', 1);
        this.GRAND_FATHER_SUBSCRIPTION = this._grandfatherLicenseHelper.getGrandfatherLicenseDetails();
        this.APP_ENGINE_SUBSCRIPTIONS = this._licenseCustTableAllotmentDAO.getActiveSubscriptionsByAllotmentType(LicensingEngineDBConstants.ALLOTMENT_TYPE_APP_ENGINE);
        this.TABLE_BUNDLE_SUBSCRIPTIONS = this._licenseCustTableAllotmentDAO.getActiveSubscriptionsByAllotmentType(LicensingEngineDBConstants.ALLOTMENT_TYPE_TABLE_BUNDLE);
    },
    /**
     *  Recommend Subscriptions to Global Custom Tables
     */
    recommendSubscriptions: function() {
        const unmappedGlobalCustomTables = this._customTableInventoryDAO.getUnmappedGlobalCustomTables();
        if (global.LicensingScriptUtil.nil(unmappedGlobalCustomTables)) {
            this._logger.logInfo(this.type, arguments.callee.name, 'Can not find any unmapped global custom tables');
            return;
        }
        this._logger.logInfo(this.type, arguments.callee.name, 'Total unmapped custom tables count:: ' + unmappedGlobalCustomTables.length);
        unmappedGlobalCustomTables.forEach(tableObject => {
            const recommendations = this.recommendSubscriptionByTableName(tableObject.table_name);
            const subscription_counts = recommendations.subscription_counts;
            const subscription_counts_sorted = this._getTopRecommendations(subscription_counts);
            const related_tables_qualifying_data = recommendations.related_tables_qualifying_data;

            //if additional recommendations allowed, add grand father subscripption if available
            if (this.MAX_RECOMMENDATIONS > subscription_counts_sorted.length) {
                this._recommendGrandfatherSubscription(subscription_counts, subscription_counts_sorted, related_tables_qualifying_data);
            }

            //if additional recommendations allowed, add app engine subscriptions if available
            if (this.MAX_RECOMMENDATIONS > subscription_counts_sorted.length) {
                this._mapAdditionalSubscriptions(this.APP_ENGINE_SUBSCRIPTIONS, subscription_counts_sorted, related_tables_qualifying_data, "App engine");
            }

            //if additional recommendations allowed, map table bundle subscriptions
            if (this.MAX_RECOMMENDATIONS > subscription_counts_sorted.length) {
                this._mapAdditionalSubscriptions(this.TABLE_BUNDLE_SUBSCRIPTIONS, subscription_counts_sorted, related_tables_qualifying_data, "Table Bundle");
            }

            this._saveRecommendations(subscription_counts_sorted, related_tables_qualifying_data, tableObject);

        });


    },
    /**
     * Recommend Subscriptions by table name
     */
    recommendSubscriptionByTableName: function(table_name) {
        try {
            const relatedTables = this._tablesSchemaHelper.getRelatedTables(table_name);
            const subscription_counts = {};
            const related_tables_qualifying_data = {};
            relatedTables.forEach(tableName => {
                const subscription_id = this._getTableSubscription(tableName);
                if (global.LicensingScriptUtil.notNil(subscription_id)) {
                    this._updateSubscriptionCount(subscription_counts, subscription_id);
                    this._addRelatedTableQualifyingData(related_tables_qualifying_data, subscription_id, tableName);
                }
            });
            return {
                subscription_counts: subscription_counts,
                related_tables_qualifying_data: related_tables_qualifying_data
            };
        } catch (error) {
            this._logger.logError(this.type, arguments.callee.name, `Unexpected error ${error} encountered in recommendation logic for table:: ${table_name}`);
        }
    },

    _getTableSubscription: function(tableName) {
        if (this._table_to_subscription_map[tableName]) {
            return this._table_to_subscription_map[tableName];
        }
        const subscription_id = this._customTableInventoryDAO.getSubscriptionIdByTableName(tableName);
        if (global.LicensingScriptUtil.notNil(subscription_id)) {
            this._table_to_subscription_map[tableName] = subscription_id;
            return subscription_id;
        }
    },

    _getTopRecommendations: function(subscription_counts) {
        return Object.entries(subscription_counts)
            .sort((subscription1, subscription2) => subscription2[1] - subscription1[1])
            .slice(0, this.MAX_RECOMMENDATIONS);
    },

    _mapAdditionalSubscriptions: function(subscriptions, subscription_counts_sorted, related_tables_qualifying_data, related_table) {
        subscriptions.forEach(subscription => {
            const subscription_id = subscription.subscriptionEntitlementId;
            if (this.MAX_RECOMMENDATIONS > subscription_counts_sorted.length &&
                !related_tables_qualifying_data.hasOwnProperty(subscription_id) &&
                this._isLicenseAvailableToMapTables(subscription_id, subscription.numTables)) {
                subscription_counts_sorted.push([subscription_id, 0]);
                this._addRelatedTableQualifyingData(related_tables_qualifying_data, subscription_id, related_table);
            }
        });
    },

    _recommendGrandfatherSubscription: function(subscription_counts, subscription_counts_sorted, related_tables_qualifying_data) {
        if (global.LicensingScriptUtil.notNil(this.GRAND_FATHER_SUBSCRIPTION) && //subscription is not nil
            global.LicensingScriptUtil.notNil(this.GRAND_FATHER_SUBSCRIPTION.licenseSysId) && //subscription sys_id is not nil
            !subscription_counts[this.GRAND_FATHER_SUBSCRIPTION.licenseSysId]) { //existing recommendations do not contain grand father subscription 
            subscription_counts_sorted.push([this.GRAND_FATHER_SUBSCRIPTION.licenseSysId, 0]);
            this._addRelatedTableQualifyingData(related_tables_qualifying_data, this.GRAND_FATHER_SUBSCRIPTION.licenseSysId, 'Grandfather license');
        }
    },

    _saveRecommendations: function(subscription_counts_sorted, related_tables_qualifying_data, tableObject) {
        subscription_counts_sorted.forEach(subscription_match_count => {
            const subscription = subscription_match_count[0];
            const qualifying_data = {};
            qualifying_data.related_tables = related_tables_qualifying_data[subscription];
            this._globalCustomTablesRecommendationDAO.insert(tableObject.custom_table_inventory_sys_id, subscription, subscription_match_count[1], qualifying_data);
        });
    },

    _addRelatedTableQualifyingData: function(qualifying_data, subscription, table) {
        if (!qualifying_data.hasOwnProperty(subscription)) {
            qualifying_data[subscription] = [];
        }
        qualifying_data[subscription].push(table);
    },

    _updateSubscriptionCount: function(subscription_counts, subscription_id) {
        subscription_counts[subscription_id] = isNaN(subscription_counts[subscription_id]) ? 1 : subscription_counts[subscription_id] + 1;
    },

    _isLicenseAvailableToMapTables: function(LICENSE_SYS_ID, AVAILABLE_COUNT) {
        const allocatedCount = this._customTableInventoryDAO.getAllocatedTableCount(LICENSE_SYS_ID);
        return (AVAILABLE_COUNT - allocatedCount) > 0;
    },

    type: 'GlobalCustomTableRecommendationService'
};
