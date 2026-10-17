var SubscriptionEntitlementData = Class.create();
/**
 * Create a value object containing details of a subscription entitlement from a subscription record.
 * Note that detailsURL is not set, it's the callers responsibility to redirect to correct URL.
 * 
 * @param {string} id GUID identifier of a subscription
 * @param {string} name of the subscription
 * @param {string} startDate date when subscription became/will become active
 * @param {string} endDate date when subscription wil end
 * @param {string} purchasedQuantity purchased quantity associated with subscription or "NA"
 * @param {string} allocatedQuantity allocated quantity associated with subscription or "NA"
 */
SubscriptionEntitlementData.fromRecord = function(id, name, startDate, endDate, purchasedQuantity, allocatedQuantity) {
	const parseQuantity = quantityStr => (quantityStr && 'na' !== quantityStr.toLowerCase() &&  'n/a' !== quantityStr.toLowerCase()) ? parseInt(quantityStr) : null;
	return new SubscriptionEntitlementData(id, name, startDate, endDate, parseQuantity(purchasedQuantity), parseQuantity(allocatedQuantity), null);
}

SubscriptionEntitlementData.prototype = {
	/**
	 * Construct a value object containing details of a subscription entitlement. The member variables are meant to 
	 * be accessed directly
	 * 
	 * @param {string} id GUID identifier of a subscription
	 * @param {string} name of the subscription
	 * @param {string} startDate date when subscription became/will become active
	 * @param {string} endDate date when subscription wil end
	 * @param {integer} purchasedQuantity purchased quantity associated with subsctiption or null if not applicable
	 * @param {integer} allocatedQuantity allocated quantity associated with subscription or null if not applicable
	 * @param {string} detailsURL the URL at which details of the subscription are displayed
	 */
    initialize: function(id, name, startDate, endDate, purchasedQuantity, allocatedQuantity, detailsURL) {
		this.id = id;
		this.name = name;
		this.start_date = startDate;
		this.end_date = endDate;
		this.purchased_quantity = purchasedQuantity;
		this.allocated_quantity = allocatedQuantity;
		this.details_url = detailsURL;
    },

    type: 'SubscriptionEntitlementData'
};
