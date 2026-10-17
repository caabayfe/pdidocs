var UserSubscriptionMapper = Class.create();
UserSubscriptionMapper.prototype = {
    initialize: function() {
        this._sysUserGrmemberDAOService = new SysUserGrmemberDAO();
        this._userHasSubscriptionDaoService = new UserHasSubscriptionDao();
        this._groupHasSubscriptionDaoService = new GroupHasSubscriptionDAO();
        this._logSourceName = `sn_entitlement.${this.type}`;
    },

    /**
     * This function will associate the users from the newly added group to the respective subscription that the group 
     * has been added to. If the user is already mapped to the subscription as part of another group, then will be skipped.
     * 
     * @param {Map} subscriptionIdToAddedGroupsMap . Key will be the subscription_entitlement sys_id and values will be list of added groups.
     * 
     */
    syncUserForGroupsAddedToSubscription: function(subscriptionIdToAddedGroupsMap) {
        if (global.LicensingScriptUtil.nil(subscriptionIdToAddedGroupsMap))
            return;
        const startTime = Date.now();
        subscriptionIdToAddedGroupsMap.forEach((listOfAddedGroupSysIds, subId) => {

            if (global.LicensingScriptUtil.nil(listOfAddedGroupSysIds) || global.LicensingScriptUtil.isEmpty(listOfAddedGroupSysIds))
                return;

            //Get list of users present in the added groups. 
            const userSysIdsFromAddedGroups = this._sysUserGrmemberDAOService.getUsersByGroupIds(listOfAddedGroupSysIds);

            //If there are no users in the new groups continue to next subscription
            if (global.LicensingScriptUtil.nil(userSysIdsFromAddedGroups) || userSysIdsFromAddedGroups.size == 0)
                return;

            //Get list of users already mapped to this subscription to determin if the above user sys ids are already present or not
            const subscribedUserIds = this._userHasSubscriptionDaoService.getUserIdsBySubscriptionId(subId);

            let userSysIdsToSubscribe = [];

            //iterate over the userSysIdsTobeAdded to check if they are already subscribed
            userSysIdsFromAddedGroups.forEach(userId => {
                if (!subscribedUserIds.has(userId)) // if the new groups users are not already subscribed to the subscription through a different group add to the list
                    userSysIdsToSubscribe.push(userId);
            });

            userSysIdsToSubscribe.forEach((userId) => {
                this._userHasSubscriptionDaoService.insert(userId, subId);
            });
            gs.info(`${this._logSourceName}- syncUserForGroupsAddedToSubscription: Processed ${userSysIdsToSubscribe.length} users for subscription ${subId}. Time taken : ${Date.now() - startTime}`);

        });
    },

    /**
     * This function will remove the users  from the deleted group, mapping to the respective subscription from the user_has_subscription table.
     * However, if the user is already mapped to the subscription as part of another group still associated with the subscription, then the user - subscription mapping record will be retained..
     * 
     * @param {Map} subscriptionIdToDeletedGroupsMap . Key will be the subscription_entitlement sys_id and values will be list of removed groups.
     *
     */
    syncUserForGroupsDeletedFromSubscription: function(subscriptionIdToDeletedGroupsMap) {
        if (global.LicensingScriptUtil.nil(subscriptionIdToDeletedGroupsMap))
            return;
        const startTime = Date.now();
        subscriptionIdToDeletedGroupsMap.forEach((listOfGroups, subId) => {
            //Get list of users present in the above groups. Need to add null check
            if (global.LicensingScriptUtil.nil(listOfGroups) || global.LicensingScriptUtil.isEmpty(listOfGroups))
                return;
            //Get list of users belonging to the groups that are removed from the subscription
            const userIdsFromDeletedGroups = this._sysUserGrmemberDAOService.getUsersByGroupIds(listOfGroups);

            if (global.LicensingScriptUtil.nil(userIdsFromDeletedGroups) || userIdsFromDeletedGroups.size == 0)
                return;

            //IF the above users do not belong to any other group that is still mapped to this subscription, then they can be deleted. Else will have to retain the record.
            // SMV1 will be deleting the group to subscription mappings before invoking this API for deleted groups

            //Get the groups that are still subscribed to the subscription
            const subscribedGroups = this._groupHasSubscriptionDaoService.getGroupIdsBySubscriptionId(subId);

            let userSysIdsToUnSubscribe = []; // variable to hold the final list of users to be unsubscribed.
            let usersToRetain = new Set();

            //If there are other groups mapped to the subscription, get the list of users which are part of deleted groups and also belong to other groups mapped to subscription
            if (global.LicensingScriptUtil.notNil(subscribedGroups) || !global.LicensingScriptUtil.isEmpty(subscribedGroups)) {
                //If there are users belonging to these groups and also to groups that are unmapped from subscription
                // those users still need to be associated with the subscription and not deleted from user_has_sub for the subid
                usersToRetain = this._sysUserGrmemberDAOService.getUsersBelongingToGroups(subscribedGroups, userIdsFromDeletedGroups);
            }
            // Users that need to be unsubscribed are ones which are not present in the above list
            userIdsFromDeletedGroups.forEach(userId => {
                if (!usersToRetain.has(userId))
                    userSysIdsToUnSubscribe.push(userId);
            });
            //Delete records for users from userSysIdsToUnSubscribe belonging to the subscription
            this._userHasSubscriptionDaoService.deleteMultiple(userSysIdsToUnSubscribe, subId);
            gs.info(`${this._logSourceName}- syncUserForGroupsDeletedFromSubscription: Processed ${userSysIdsToUnSubscribe.length} users for subscription ${subId}. Time taken : ${Date.now() - startTime}`);

        });
    },
    /**
     * This function will clean up the user has subscription table for each subscription and add all the users from the associated groups to the table.
     * 
     */
    syncUsersToSubscriptions: function() {
        const startTime = Date.now();
        //Get list of users already mapped to this subscription to determin if the above user sys ids are already present or not
        this._userHasSubscriptionDaoService.updateAllRecordsForDelete();

        //get Map of subscriptions to groups
        const subscriptionToGroupsMap = this._groupHasSubscriptionDaoService.getMapofSubscriptionIdToMappedGroups();

        //Iterate over each Map entry for subId -> List of associated groups
        if (subscriptionToGroupsMap.size === 0) {
            gs.info('No group to subscription mapping records are present.');
            return;
        }
        subscriptionToGroupsMap.forEach((listOfAddedGroupIds, subId) => {
            const subIdIterationStartTime = Date.now();
            const userIdsToSubscribe = new Set();
            //Get set of users from the list of groups
            listOfAddedGroupIds.forEach((groupId) => {
                const userIdsArray = this._sysUserGrmemberDAOService.getUsersByGroupId(groupId);
                userIdsArray.forEach(userId => userIdsToSubscribe.add(userId));
            });
            //insert mapping to subscription for all users
            userIdsToSubscribe.forEach((userId) => {
                this._userHasSubscriptionDaoService.insert(userId, subId);
            });
            gs.debug(`${this._logSourceName}- syncUsersToSubscriptions: Processed ${userIdsToSubscribe.size} users for subscription ${subId}. Time taken to process : ${Date.now() - subIdIterationStartTime}`);

        });
        gs.info(`${this._logSourceName}- syncUsersToSubscriptions: Processed  users subscription Mapping. Time taken to process : ${Date.now() - startTime}`);
    },



    type: 'UserSubscriptionMapper'
};
