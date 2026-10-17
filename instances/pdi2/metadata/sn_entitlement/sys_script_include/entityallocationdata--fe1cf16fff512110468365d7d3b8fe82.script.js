var EntityAllocationData = Class.create();
EntityAllocationData.prototype = {

    /**
     * Models the (un)allocation data for a user or group
     *
     * @param {string} keyName The name of the user/group key. (e.g. sys_user.sys_id)
     * @param {string} keyValue The value of the user/group key (e.g. the sys_id for the record)
     * @param {json} qualifying_data The JSON blob with the qualifying data for the record
     * @param {array} assigned_roles The roleIds assigned to the entity
     * @param {array} subscribeable_roles The roleIds assigned to the entity that are subscribeable
     * @param {array} subscribed_roles The roleIds assigned to the entity that are subscribed
     * @param {array} unsubscribed_roles The roleIds assigned to the entity that require a subscription but don't have one
     * @param {array} allocated_subscription_ids The subscriptionIds the entity is subscribed to
     * @param {array} unallocated_subscription_ids The subscriptionIds the entity is unallocated to
     * @param {bool} is_unallocated True if the user is unallocated for at least one subscription
     */
    initialize: function(keyName, keyValue, qualifying_data, assigned_roles, subscribeable_roles, subscribed_roles, unsubscribed_roles, allocated_subscription_ids, unallocated_subscription_ids, is_unallocated) {
        this[keyName] = keyValue;
        this.qualifying_data = qualifying_data;
        this.assigned_roles = assigned_roles;
        this.subscribeable_roles = subscribeable_roles;
        this.subscribed_roles = subscribed_roles;
        this.unsubscribed_roles = unsubscribed_roles;
        this.allocated_subscription_ids = allocated_subscription_ids;
        this.unallocated_subscription_ids = unallocated_subscription_ids;
        this.is_unallocated = is_unallocated;
    },

    type: 'EntityAllocationData'
};
