var UnmappedCustomApplicationRecommendationService = Class.create();
UnmappedCustomApplicationRecommendationService.prototype = {
    initialize: function() {
        this._logger = new LoggingUtil();
        this._customTableInventoryDAO = new CustomTableInventoryDAO();
        this._tablesSchemaHelper = new TablesSchemaHelper();
        this._licenseCustTableAllotmentDAO = new LicenseCustTableAllotmentDAO();
        this._customApplicationsRecommendationDAO = new CustomApplicationsRecommendationDAO();
        this._licenseRoleDiscoveredDao = new LicenseRoleDiscoveredDao();
        this.MAX_RECOMMENDATIONS = gs.getProperty('sn_entitlement.max_recommendations_for_unallocated_custom_apps', 1);
        this.APP_ENGINE_SUBSCRIPTIONS = this._licenseCustTableAllotmentDAO.getActiveSubscriptionsByAllotmentType(LicensingEngineDBConstants.ALLOTMENT_TYPE_APP_ENGINE);
        this.TABLE_BUNDLE_SUBSCRIPTIONS = this._licenseCustTableAllotmentDAO.getActiveSubscriptionsByAllotmentType(LicensingEngineDBConstants.ALLOTMENT_TYPE_TABLE_BUNDLE);
    },
    /**
     * Recommend subscriptions to unmapped custom apps
     */
    recommendSubscriptions: function() {
        const unmappedCustomAppsWithTables = this._customTableInventoryDAO.getUnmappedCustomApplicationDetails();
        if (global.LicensingScriptUtil.nil(unmappedCustomAppsWithTables)) {
            this._logger.logInfo(this.type, arguments.callee.name, 'Can not find any unmapped custom apps');
            return;
        }
        this._logger.logInfo(this.type, arguments.callee.name, 'Found unmapped custom apps');
        const scopes = Object.keys(unmappedCustomAppsWithTables);

        scopes.forEach(scope_sys_id => {
            try {
                this._qualifying_data = {};
                const subscription_counts = this._getSubscriptionByTablesInScope(unmappedCustomAppsWithTables[scope_sys_id]);
                let subscription_counts_sorted = this._getTopRecommendations(subscription_counts);

                //if additional recommendations allowed, add app engine subscriptions if available
                if (this.MAX_RECOMMENDATIONS > subscription_counts_sorted.length) {
                    const additional_subscriptions = this._getAdditionalSubscriptions(this.APP_ENGINE_SUBSCRIPTIONS, subscription_counts_sorted, "App engine");
                    subscription_counts_sorted = subscription_counts_sorted.concat(additional_subscriptions);
                }

                //if additional recommendations allowed, map table bundle subscriptions
                if (this.MAX_RECOMMENDATIONS > subscription_counts_sorted.length) {
                    const additional_subscriptions = this._getAdditionalSubscriptions(this.TABLE_BUNDLE_SUBSCRIPTIONS, subscription_counts_sorted, "Table Bundle");
                    subscription_counts_sorted = subscription_counts_sorted.concat(additional_subscriptions);
                }
                this._saveRecommendations(subscription_counts_sorted, scope_sys_id);
            } catch (error) {
                this._logger.logInfo(this.type, arguments.callee.name, `Unexpected error ${error} encountered in recommendation logic for app scope_sys_id:: ${scope_sys_id}`);
            }
        });
    },

    /**
     * Get subscription recommendations based on custom tables in a scope
     */
    _getSubscriptionByTablesInScope: function(custom_tables) {
        const related_table = custom_tables.flatMap(table => {
            return this._tablesSchemaHelper.getRelatedTables(table);
        });
        const subscription_counts = {};
        related_table.forEach(table_name => {
            const subscription_id = this._customTableInventoryDAO.getSubscriptionIdByTableName(table_name);
            if (gs.nil(subscription_id)) {
                return;
            }
            this._addRelatedTableQualifyingData(subscription_id, table_name);
            subscription_counts[subscription_id] = isNaN(subscription_counts[subscription_id]) ? 1 : subscription_counts[subscription_id] + 1;
        });
        return subscription_counts;

    },
    /**
     * get top recommendations based on weigh of a subscription
     */
    _getTopRecommendations: function(subscription_counts) {
        return Object.entries(subscription_counts)
            .sort((subscription1, subscription2) => subscription2[1] - subscription1[1])
            .slice(0, this.MAX_RECOMMENDATIONS);
    },

    _getAdditionalSubscriptions: function(subscriptions, subscription_counts_sorted, related_table) {
        const additional_subscriptions = [];
        let subscription_count = subscription_counts_sorted.length;
        subscriptions.forEach(subscription => {
            if (this.MAX_RECOMMENDATIONS <= subscription_count) {
                return false;
            }
            const subscription_id = subscription.subscriptionEntitlementId;
            if (!this._qualifying_data.hasOwnProperty(subscription_id) &&
                this._isLicenseAvailableToMapTables(subscription_id, subscription.numTables)) {
                subscription_count++;
                additional_subscriptions.push([subscription_id, 0]);
                this._addRelatedTableQualifyingData(subscription_id, related_table);
            }
        });
        return additional_subscriptions;
    },

    _isLicenseAvailableToMapTables: function(LICENSE_SYS_ID, AVAILABLE_COUNT) {
        const allocatedCount = this._customTableInventoryDAO.getAllocatedTableCount(LICENSE_SYS_ID);
        return (AVAILABLE_COUNT - allocatedCount) > 0;
    },

    _saveRecommendations: function(subscription_counts_sorted, scope_sys_id) {
        subscription_counts_sorted.forEach(subscription_match_count => {
            const subscription = subscription_match_count[0];
            const meta_data = {};
            meta_data.recommendation_reason = this._qualifying_data[subscription];
            this._customApplicationsRecommendationDAO.insert(scope_sys_id, subscription, subscription_match_count[1], meta_data);
        });
    },

    _addRelatedTableQualifyingData: function(subscription, table) {
        if (!this._qualifying_data.hasOwnProperty(subscription)) {
            this._qualifying_data[subscription] = [];
        }
        this._qualifying_data[subscription].push(table);
    },

    type: 'UnmappedCustomApplicationRecommendationService'
};
