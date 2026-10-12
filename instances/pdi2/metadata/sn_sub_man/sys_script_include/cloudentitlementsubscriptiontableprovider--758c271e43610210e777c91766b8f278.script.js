var CloudEntitlementSubscriptionTableProvider = Class.create();
CloudEntitlementSubscriptionTableProvider.prototype = {
    initialize: function() {
        this.cloudEntitlementDetailDAO = new sn_sub_man.CloudEntitlementDetailDAO();
    },

    getRows: function() {
		const subscriptions = [];
        const subscriptionGR = this.cloudEntitlementDetailDAO.getSubscriptionsGR();
        while (subscriptionGR.next()) {
            subscriptions.push(this._insertRow(subscriptionGR));
        }
        return subscriptions;
    },

    _insertRow: function(subscriptionGR) {
        const quantity = subscriptionGR.getValue('purchased_quantity');
        const capacity = subscriptionGR.getValue('storage_capacity');
        const type = subscriptionGR.getValue('hosting_type');
        const showType = (type == sn_entitlement.LicensingEngineConstants.HOSTING_TYPE_VALUE[sn_entitlement.LicensingEngineConstants.HOSTING_TYPE_SHARED]) ? "Shared-storage" : "Dedicated-storage";
        return {
            "capacity_per_unit_tb": capacity,
            "purchased_quantity": quantity,
            "type": showType,
            "total_purchased_pool_capacity_tb": capacity * quantity,
            "product": subscriptionGR.getValue('name'),
            "start_date": subscriptionGR.getValue('start_date'),
            "end_date": this._getEndDate(subscriptionGR.getValue('end_date')),
			"product_code": subscriptionGR.getValue('product_code'),
			"definition_id": subscriptionGR.getValue('definition_id'),
            "sys_id": gs.generateGUID()
        };
    },

	_getEndDate: function(endDate) {
		const year = (new Date(endDate)).getFullYear();
		if(year > 2999 || Number.isNaN(year)) {
			return '-';
		}
		return endDate;
	},

    type: 'CloudEntitlementSubscriptionTableProvider'
};
