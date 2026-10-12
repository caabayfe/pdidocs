var UnconfirmedUsersReportingUtil = Class.create();
UnconfirmedUsersReportingUtil.prototype = {
    initialize: function() {
        this._subscriptionRoleService = new sn_entitlement.PassThroughCache(new sn_entitlement.SubscriptionRoleService(false));
        this._unallocatedUserAllocationDataViewDao = new sn_entitlement.UnallocatedUserAllocationDataViewDao();
        this._unconfirmedUserRoleDao = new sn_entitlement.UnconfirmedUserRoleDao();
        //we need to lock on a record that exists in a table with the proper attributes and columns required for mutex locking, since the operations in this class are only meaningful IF we have subscription entitlement entries, it was decided to key off that table, the lowest entitlement_id present in the table.
        const lockRecord = new GlideRecord("subscription_entitlement");
        lockRecord.addNotNullQuery("entitlement_id");
        lockRecord.orderBy("entitlement_id");
        lockRecord.setLimit(1);
        lockRecord.query();
        lockRecord.next();
        this._lock = new GlideNativeRecordMutex(lockRecord);
    },

    /**
     * updates the list of unsubscribed users and their associated subscriptions and roles relevant to the subscriptions
     */
    generateReport: function() {
        if (!this._lock.get()) { // error -- record no longer exists
            return;
        }

        try { // this thread now has exclusive access to the record across the cluster (if other jobs are also using GlideNativeRecordMutex to protect it)
            const query = this._unallocatedUserAllocationDataViewDao.getStreamForSelectedColumns(["sd_subscription", "uad_unsubscribed_roles", "uad_user", "su_user_name"]);
            this._unconfirmedUserRoleDao.deleteAll();

            query.forEach((entry) => {
                const subscriptionId = entry.sd_subscription;
                const rolesForSubscription = this._subscriptionRoleService.getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId);
                const unsubscribedRoleIds = entry.uad_unsubscribed_roles.split(',').filter((role) => rolesForSubscription.includes(role));

                this._unconfirmedUserRoleDao.insert(subscriptionId, entry.uad_user, entry.su_user_name, unsubscribedRoleIds);
            });
        } finally {
            this._lock.release(); // important to call this in a `finally` -- if abandoned, the record will remain locked until it expires (after 1 minute by default, though that is tunable)
        }
    },

    type: 'UnconfirmedUsersReportingUtil'
};
