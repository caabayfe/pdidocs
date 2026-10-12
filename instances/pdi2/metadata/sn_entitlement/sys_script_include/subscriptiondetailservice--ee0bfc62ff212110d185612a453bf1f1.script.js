var SubscriptionDetailService = Class.create();
SubscriptionDetailService.prototype = {
    initialize: function() {
        this._allocationService = new sn_entitlement.AllocationDataService();
        this._statsService = new sn_entitlement.SubscriptionStatsService();
        this._sdDao = new sn_entitlement.dao_SubscriptionDetail();
        this._instanceStatsDao = new sn_entitlement.dao_SubscriptionInstanceStats();
        this._subscriptionContext = new sn_entitlement.UnallocatedEntityCalculation_ContextFactory().createSubscriptionContext();
        this._engineUtils = new sn_lef.EntitlementEngineUtils();
        this._unallocatedGroupRecommendationService = new UnallocatedGroupRecommendationService();
        this._subscriptionService = new sn_entitlement.SubscriptionService(false);
        this._userDao = new sn_entitlement.UserDao();
        this._userM2mDao = new sn_entitlement.dao_userAllocationDataM2mSubscriptionDetailDao();
        this._groupM2mDao = new sn_entitlement.dao_groupAllocationDataM2mSubscriptionDetailDao();
        this._sysStoreAppDao = new sn_entitlement.SysStoreAppDao();
        this.LICENSING_ENGINE_PLUGIN = "com.sn_licensing_engine";
    },

    /**
     * Initiates creation of subscription_detail records and all related records and stats IFF the number
     *   of users + groups is below the threshold
     */
    createSubscriptionDetailsSafely: function() {
        const shouldGeneratePerUserDetails = this._shouldGeneratePerUserDetails();
        new sn_entitlement.SubscriptionDetailService().createSubscriptionDetails(shouldGeneratePerUserDetails);
    },

    _shouldGeneratePerUserDetails: function() {
        this.logger = new LoggingUtil();
        const SUBSCRIPTION_DETAILS = "Subscription Details";

        if (gs.getProperty(LicensingEngineConstants.PROP_UNCONFIRMEDCALCULATION_DISABLED, "false").toLowerCase() === "true") {
            this.logger.logInfo("SubscriptionDetailService", SUBSCRIPTION_DETAILS, 'SubscriptionDetailService - abort due to unconfirmed calculation disabled via system property');
            return false;
        }

        const ss = new sn_entitlement.SubscriptionService();
        const entityTotal = ss.getUserCountByNeedsToBeProcessed() + ss.getGroupCountByNeedsToBeProcessed();

        const entityMax = parseInt(gs.getProperty('glide.entitlement.unconfirmedcalculation.max.entities', '100000'));
        if (entityTotal > entityMax) {
            this.logger.logInfo("SubscriptionDetailService", SUBSCRIPTION_DETAILS, `SubscriptionDetailService - abort due to user + group count of ${entityTotal}`);
            return false;
        }
        return true;
    },

    /**
     * Initiates creation of subscription_detail records and all related records and stats
     */
    createSubscriptionDetails: function(shouldGeneratePerUserDetails = true) { //default to create the per user details if parameter not provided
        const map = this._sdDao.createSubscriptionDetailsMap();
        const subscriptionIds = Object.keys(map);

        let stats = null;
        if (shouldGeneratePerUserDetails) {
            const groups = this._subscriptionService.getUnallocatedGroupCalculationsByAllSubscriptions();
            stats = this._subscriptionService.calculateUnallocatedUsersByAllSubscriptions(map, subscriptionIds);

            groups.forEach(group => {
                const allocationId = this._allocationService.persistGroupAllocationData(map, group);
                stats.addGroupData(group);
                this._unallocatedGroupRecommendationService.createRecommendations(allocationId);
            });
        }

        // stats
        subscriptionIds.forEach(subscriptionId => {
            const detailId = map[subscriptionId];

            let detailEntry = {};
            detailEntry.sysId = detailId;
            detailEntry.subscription = subscriptionId;
            if (shouldGeneratePerUserDetails) {
                detailEntry.unconfirmedUserCount = stats.getUnallocatedUserCount(subscriptionId);
                detailEntry.allocatedUserCount = stats.getAllocatedUserCount(subscriptionId);
                detailEntry.unconfirmedGroupCount = stats.getUnallocatedGroupCount(subscriptionId);
                detailEntry.allocatedUserWithoutLicensableRoleCount = stats.getAllocatedUsersWithoutLicensableRoleCount(subscriptionId);

                // TODO: Need a different calculation method for this.
                //    The current statsService.calculateAllocatedUserCount() does not take roles into consideration
                //    as a user is allocated if they are mapped to a subscription. Their roles don't matter. So a
                //    different calculation is needed for this stat.
                detailEntry.allocatedUserOobCount = 0;

                // Note: Due to performance issues with the previous code, this is being set explicitly to 0 for now
                //    until a more performant implementation can be made.
                detailEntry.unconfirmedUserOobCount = 0;

                detailEntry.licensableGroupCount = stats.getLicensableGroupCount(subscriptionId);
                detailEntry.licensableGroupSubscribedCount = stats.getLicensableGroupSubscribedCount(subscriptionId);
            } else {
                detailEntry.unconfirmedUserCount = 0;
                detailEntry.allocatedUserCount = 0;
            }

            const licenseQuotaId = this._subscriptionContext.getQuotaIdBySubscriptionId(subscriptionId); //this line and below is for non-per user subscriptions

            const quotaCount = parseInt(this._engineUtils.calculateAllocation(licenseQuotaId, ""));
            detailEntry.allocatedQuotaCount = Number.isInteger(quotaCount) && quotaCount > 0 ? quotaCount : 0;
            detailEntry.allocatedCustomTableCount = Math.max(this._statsService.getCustomTableAllocationCount(subscriptionId), 0);

            detailEntry.licensingEngineVersion = this._sysStoreAppDao.getVersion(this.LICENSING_ENGINE_PLUGIN);

            this._sdDao.updateRecord(detailEntry);
        });

        //write instance level stats
        let unallocatedUserMultiSubscriptionCount = shouldGeneratePerUserDetails ? stats.getUnallocatedUserMultiSubscriptionCount() : 0;
        let allocatedUserMultiSubscriptionCount = shouldGeneratePerUserDetails ? stats.getAllocatedUserMultiSubscriptionCount() : 0;
        let allocatedLicensableUserCount = shouldGeneratePerUserDetails ? stats.getUsersWithALicensableRoleAndSubscriptionCount() : 0;
        let licensableUserCount = shouldGeneratePerUserDetails ? stats.getUsersWithALicensableRoleCount() : 0;

        this._instanceStatsDao.markOldInstanceStatsRecords();
        this._instanceStatsDao.writeSubscriptionInstanceStats({
            "licensableUserCount": licensableUserCount,
            "allocatedLicensableUserCount": allocatedLicensableUserCount,
            "allocatedUserMultiBucketCount": allocatedUserMultiSubscriptionCount,
            "unconfirmedUserMultiBucketCount": unallocatedUserMultiSubscriptionCount
        });
        //done with stats
        this._sdDao.completeSubscriptionDetails(map); // todo include a union of the useless details entries(ie. non per user)

        // Flush cache since data has been recalculated
        new SubscriptionUsageUtils().flushCache();

        //fire event to regenerate the unconfirmed_user_role entries
        gs.eventQueue("sn_entitlement.unconfirmed_users_report");
    },

    /**
     * Updates the calculations on the is_latest=true subscription detail records for the users provided
     *
     * @param {array} userIds An array of sys_user.sys_id values to re-calculate
     * @param {object} subscriptionMap A json object where the key is a subscription and the value is the corresponding subscription detail id
     */
    partialUpdateSubscriptionDetailsByUsers: function(userIds, subscriptionMap = null) {
        gs.info(`Calculating partial update for userIds: ${JSON.stringify(userIds)}`);

        const map = subscriptionMap || this._sdDao.getSubscriptionDetailsMapByIsLatest();

        // Soft-delete existing user data
        const subscriptionDetailIds = Object.values(map);
        this._userM2mDao.softDeleteBySubscriptionDetailIdsAndUserIds(subscriptionDetailIds, userIds);

        // Generate new user data
        this._subscriptionService.calculateUnallocatedUserByUserIds(userIds, map);

        // Flush cache since data has been recalculated
        new SubscriptionUsageUtils().flushCache();
    },

    /**
     * Updates the calculations on the is_latest=true subscription detail records for the groups provided
     * It will also update the members of the groups
     *
     * @param {array} groupIds An array of sys_user_group.sys_id values to re-calculate
     */
    partialUpdateSubscriptionDetailsByGroups: function(groupIds) {
        gs.info(`Calculating partial update for groupIds: ${JSON.stringify(groupIds)}`);

        const map = this._sdDao.getSubscriptionDetailsMapByIsLatest();

        // Soft-delete existing group data
        const subscriptionDetailIds = Object.values(map);
        this._groupM2mDao.softDeleteBySubscriptionDetailIdAndGroupId(subscriptionDetailIds, groupIds);

        // Generate new group data
        const groups = this._subscriptionService.getUnallocatedGroupCalculationsByGroupIds(groupIds);
        groups.forEach(group => {
            const allocationId = this._allocationService.persistGroupAllocationData(map, group);
            this._unallocatedGroupRecommendationService.createRecommendations(allocationId);
        });

        // Update users that are members of the impacted groups
        const userIdsToUpdate = this._userDao.getUserIdsByValidAndIsAMemberOfOneOfTheGroups(groupIds);
        this.partialUpdateSubscriptionDetailsByUsers(userIdsToUpdate, map);

        // Flush cache since data has been recalculated
        new SubscriptionUsageUtils().flushCache();

        //fire event to regenerate the unconfirmed_user_role entries
        gs.eventQueue("sn_entitlement.unconfirmed_users_report");
    },

    setM2MRecordsBeingProcessedToUIVisibleFalse: function(groupIds, subscriptionId) {
        try {
            this._groupM2mDao.updateRecordsBeingProcessedToUIVisibleFalse(groupIds, subscriptionId);
        } catch (e) {
            gs.info("Unable to set records being processed to inactive for UI for subscription " + e);
        }
    },

    type: 'SubscriptionDetailService'
};
