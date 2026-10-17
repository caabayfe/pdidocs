var AllocationDataService = Class.create();
AllocationDataService.prototype = {
    initialize: function() {
        this._writeUserAllocationDataEnabled = gs.getProperty('glide.entitlement.write_user_allocation_data.enabled', true).toLowerCase() === 'true';
        this._writeGroupAllocationDataEnabled = gs.getProperty('glide.entitlement.write_group_allocation_data.enabled', true).toLowerCase() === 'true';

        this._userM2mDao = new sn_entitlement.dao_userAllocationDataM2mSubscriptionDetailDao();
        this._userUtil = new sn_entitlement.dao_AllocationDataDaoUtils('user_allocation_data', 'sys_user.sys_id', 'user');
        this._groupM2mDao = new sn_entitlement.dao_groupAllocationDataM2mSubscriptionDetailDao();
        this._groupUtil = new sn_entitlement.dao_AllocationDataDaoUtils('group_allocation_data', 'sys_user_group.sys_id', 'group');
    },

    /**
     * Persists a user allocation data to the database
     *
     * @param {object} an object map of subscription_entitlement sysids to subscription_detail sysids 
     * @param {object} user An allocatedUser value to persist to the database
     * @returns {string} The sys_id of the user_allocation_data record created. null if none was created
     */
    persistUserAllocationData: function(map, user) {
        if (!this._writeUserAllocationDataEnabled)
            return null;

        const allocationId = this._userUtil.insertAllocatedEntry(user);

        const unallocated_subscription_ids = user.unallocated_subscription_ids || [];
        unallocated_subscription_ids.forEach(subId => this._userM2mDao.insertEntry(allocationId, map[subId], 'false'));

        const allocated_subscription_ids = user.allocated_subscription_ids || [];
        allocated_subscription_ids.forEach(subId => this._userM2mDao.insertEntry(allocationId, map[subId], 'true'));

        return allocationId;
    },

    /**
     * Persists a group allocation data to the database
     *
     * @param {object} an object map of subscription_entitlement sysids to subscription_detail sysids 
     * @param {object} group An allocatedGroup value to persist to the database
     * @returns {string} The sys_id of the group_allocation_data record created. null if none was created
     */
    persistGroupAllocationData: function(map, group) {
        if (!this._writeGroupAllocationDataEnabled)
            return null;

        const allocationId = this._groupUtil.insertAllocatedEntry(group);

        const unallocated_subscription_ids = group.unallocated_subscription_ids || [];
        unallocated_subscription_ids.forEach(subId => this._groupM2mDao.insertEntry(allocationId, map[subId], 'false'));

        const allocated_subscription_ids = group.allocated_subscription_ids || [];
        allocated_subscription_ids.forEach(subId => this._groupM2mDao.insertEntry(allocationId, map[subId], 'true'));

        return allocationId;
    },

    type: 'AllocationDataService'
};
