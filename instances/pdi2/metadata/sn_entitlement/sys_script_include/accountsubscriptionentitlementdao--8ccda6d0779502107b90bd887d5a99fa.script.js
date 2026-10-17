var AccountSubscriptionEntitlementDAO = Class.create();
AccountSubscriptionEntitlementDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
    },

    insertAccountSubEntRecord: function(entitlementSysID, instanceID) {
        if (this.recordExists(entitlementSysID, instanceID))
            return;

        try {
            let accountSubscriptionEntitlementGR = new GlideRecord(LicensingEngineDBConstants.ACCOUNT_SUBSCRIPTION_ENTITLEMENT);
            accountSubscriptionEntitlementGR.initialize();
            accountSubscriptionEntitlementGR.entitlement = entitlementSysID;
            accountSubscriptionEntitlementGR.instance = instanceID;
            accountSubscriptionEntitlementGR.insert();
        } catch (ex) {
            this.logger.logErrorWithoutAudit(this.type, "insertAccountSubEntRecord", "Encountered an exception while populationg account_subscription_entitlement : " + ex.message);
        }
    },

    recordExists: function(entitlementSysID, instanceID) {
        let accountSubEntRecord = new GlideRecord(LicensingEngineDBConstants.ACCOUNT_SUBSCRIPTION_ENTITLEMENT);
        accountSubEntRecord.addQuery(LicensingEngineDBConstants.ENTITLEMENT, entitlementSysID);
        accountSubEntRecord.addQuery(LicensingEngineDBConstants.INSTANCE, instanceID);
        accountSubEntRecord.query();

        if (accountSubEntRecord.next())
            return true;
        return false;
    },

    type: 'AccountSubscriptionEntitlementDAO'
};
