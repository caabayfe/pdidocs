var LicenseDetailsAuditLogDAO = Class.create();
LicenseDetailsAuditLogDAO.prototype = {
    initialize: function() {
		this._licenseDetailsAuditLogTable = "license_details_audit_log";
	},

    /**
     * @returns {array} An array contains list of product code that have entitlement purchase history
     */
    getProductCodesThatHavePurchaseHistoryLog: function() {
        const count = new GlideAggregate(this._licenseDetailsAuditLogTable);
        count.addAggregate('COUNT', 'license');
        count.groupBy('license');
        count.query();

        let product_code = [];
        while (count.next()) {
            var licenseGr = new GlideRecord('license_details');
            licenseGr.get(count.getValue('license'));
            if (licenseGr.isValid())
                product_code.push(licenseGr.getValue('product_code'));
        }
        return product_code;
    },

    /**
	 * Get the entitlement Purchase history 
	 * 
     * @param {productCodeToSubscriptionSysIdMap} this to look up ems subscription sysId for a product code
     * 
     * @returns {array} contains entitlement purchase history
     */
    getEntitlementPurchaseHistory: function(productCodeToSubscriptionSysIdMap) {
        let subscriptionHistoryLog = [];
		
		if (global.LicensingScriptUtil.nil(productCodeToSubscriptionSysIdMap))
            return subscriptionHistoryLog;

        for (const productCode of Object.keys(productCodeToSubscriptionSysIdMap)) {
            const auditLogGr = new GlideRecord(this._licenseDetailsAuditLogTable);
            auditLogGr.addQuery('license.product_code', productCode);
            auditLogGr.query();

            while (auditLogGr.next()) {
                let subscriptionLogObject = {
                    action: String(auditLogGr.getValue('action')),
                    subscription: productCodeToSubscriptionSysIdMap[String(auditLogGr.getElement('license.product_code'))],
                    new_end_date: String(auditLogGr.getValue('new_end_date')),
                    new_purchased_count: String(auditLogGr.getValue('new_purchased_count')),
                    new_start_date: String(auditLogGr.getValue('new_start_date')),
                    time_stamp: String(auditLogGr.getValue('time_stamp'))
                };
                subscriptionHistoryLog.push(subscriptionLogObject);
            }
        }

		return subscriptionHistoryLog;
    },

    type: 'LicenseDetailsAuditLogDAO'
};
