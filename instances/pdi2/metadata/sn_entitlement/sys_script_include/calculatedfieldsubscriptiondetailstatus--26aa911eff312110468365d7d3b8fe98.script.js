var CalculatedFieldSubscriptionDetailStatus = Class.create();
CalculatedFieldSubscriptionDetailStatus.prototype = {
    initialize: function() {
        this._subscriptionUsageUtils = new sn_entitlement.SubscriptionUsageUtils();
        this._displayTypeDisplayOnly = parseInt(sn_entitlement.LicensingEngineConstants.DISPLAY_TYPE_DISPLAY_ONLY);
        this._subscriptionTypeUnlimitedUser = parseInt(sn_entitlement.LicensingEngineConstants.UNLIMITED_USER_LICENSE);

    },

    calculateStatus: function(current) {
        try {
            if (!current)
                return 'na';

            return this._isRecordV1(current) ?
                this._calculateAllocatedStatusV1(current) :
                this._calculateAllocatedStatusv2(current);
        } catch (err) {
            return 'na';
        }
    },

    _isRecordV1: function(current) {
        return current.license && !current.subscription;
    },

    _calculateAllocatedStatusV1: function(current) {
        return current.license.allocated_status ? current.license.allocated_status : 'na';
    },

    _calculateAllocatedStatusv2: function(current) {
        const meter_type = this._getMeterType(current);
        if ('creator' == meter_type) {
            return 'account_level';
        }
        const displayType = parseInt(current.subscription.display_type);
        const subscriptionType = parseInt(current.subscription.subscription_type);
        if (!current.subscription || !current.subscription.purchased_count || displayType === this._displayTypeDisplayOnly || subscriptionType === this._subscriptionTypeUnlimitedUser)
            return 'na';

        const threshold = Number(gs.getProperty('sn_sub_man.u_subscription_threshold', 90));
        const purchased = Number(current.subscription.purchased_count);
        const allocated = this._getAllocatedCount(current);

        if (!Number.isInteger(purchased) || !Number.isInteger(allocated))
            return 'na';

        if (allocated >= threshold / 100 * purchased && allocated < purchased)
            return 'near'; // Near Capacity

        if (purchased > allocated)
            return 'under'; // Compliant

        if (purchased == allocated)
            return 'even'; // Even

        return 'over'; // Over-allocated
    },

    /**
     * Look for all the possible fields to get the allocated count, since we calculate counts for each record in subscription_entitlement
     * Only one field in 'current' is expected to have a value > 0
     */
    _getAllocatedCount: function(current) {
        if (gs.nil(current.allocated_user_count) && !current.allocated_custom_table_count)
            return null;

        return current.allocated_custom_table_count > 0 ?
            Number(current.allocated_custom_table_count) :
            Number(this._subscriptionUsageUtils.calculateRealtimeAllocation(current));
    },

    _getMeterType: function(current) {
        if (gs.nil(current.subscription.meter_type)) {
            return;
        }
        return current.subscription.meter_type.trim().toLowerCase();
    },
    type: 'CalculatedFieldSubscriptionDetailStatus'
};
