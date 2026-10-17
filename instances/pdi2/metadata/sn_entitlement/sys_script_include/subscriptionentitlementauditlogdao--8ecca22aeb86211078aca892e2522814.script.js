var SubscriptionEntitlementAuditLogDAO = Class.create();
SubscriptionEntitlementAuditLogDAO.prototype = {
    initialize: function() {
        this._subscriptionEntitlementAuditLogTable = "subscription_entitlement_audit_log";
    },

    migrateEntitlementPurchaseHistory: function(entitlementPurchaseHistory) {
        const subscriptionEntitlementAuditGR = new GlideAggregate(this._subscriptionEntitlementAuditLogTable);
        subscriptionEntitlementAuditGR.addAggregate('COUNT');
        subscriptionEntitlementAuditGR.query();

        if (subscriptionEntitlementAuditGR.next() && subscriptionEntitlementAuditGR.getAggregate('COUNT') > 0)
            this._insertIfEntitlementPurchaseHistoryMissing(entitlementPurchaseHistory);
        else
            this._insert(entitlementPurchaseHistory);
    },

    _insertIfEntitlementPurchaseHistoryMissing: function(entitlementPurchaseHistory) {
        const missingEntitlementPurchaseHistory = this._findMissingEntitlementPurchaseHistory(entitlementPurchaseHistory);
        if (!global.LicensingScriptUtil.nil(missingEntitlementPurchaseHistory))
            this._insert(missingEntitlementPurchaseHistory);
    },

    _findMissingEntitlementPurchaseHistory: function(entitlementPurchaseHistory) {
        let missingEntitlementPurchaseHistory = [];
        const gr = new GlideRecord(this._subscriptionEntitlementAuditLogTable);
        entitlementPurchaseHistory.forEach(function(record) {
            gr.initialize();
            for (const key in record)
                gr.addQuery(key, record[key]);
            gr.query();
            if (!gr.hasNext())
                missingEntitlementPurchaseHistory.push(record);
        });
        return missingEntitlementPurchaseHistory;
    },

    _insert: function(entitlementPurchaseHistory) {
        const gr = new GlideRecord(this._subscriptionEntitlementAuditLogTable);
        entitlementPurchaseHistory.forEach(function(record) {
            gr.initialize();
            for (const key in record)
                gr.setValue(key, record[key]);
            gr.insert();
        });
    },

    type: 'SubscriptionEntitlementAuditLogDAO'
};
