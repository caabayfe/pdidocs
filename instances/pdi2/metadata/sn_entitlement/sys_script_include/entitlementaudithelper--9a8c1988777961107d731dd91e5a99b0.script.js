var EntitlementAuditHelper = Class.create();
EntitlementAuditHelper.prototype = {
    initialize: function() {
        this.SUBSCRIPTION_ENTITLEMENT_AUDIT_LOG = "subscription_entitlement_audit_log";

        this.CREATED = "created";
        this.INACTIVATED = "inactivated";
        this.UPDATED = "updated";
        this.EXPIRED = "expired";

    },

    recordSubscriptionAdded: function(currEntitlementGR) {
        this.record(currEntitlementGR, null, this.CREATED);
    },

    recordSubscriptionInactivated: function(currEntitlementGR, prevEntitlementGR) {
        var serializedPrevEntitlement = new global.LicensingEngineGlobalHelper().serialize(prevEntitlementGR);
        this.record(currEntitlementGR, serializedPrevEntitlement, this.INACTIVATED);
    },

    recordSubscriptionExpired: function(currEntitlementGR, prevEntitlementGR) {
        var serializedPrevEntitlement = new global.LicensingEngineGlobalHelper().serialize(prevEntitlementGR);
        this.record(currEntitlementGR, serializedPrevEntitlement, this.EXPIRED);
    },

    recordSubscriptionUpdated: function(currEntitlementGR, prevEntitlementGR) {
        var serializedPrevEntitlement = new global.LicensingEngineGlobalHelper().serialize(prevEntitlementGR);
        this.record(currEntitlementGR, serializedPrevEntitlement, this.UPDATED);
    },

    record: function(currEntitlementGR, serializedPrevEntitlement, action) {
        if (!this._validateAuditInput(currEntitlementGR, action))
            return;

        var opTime = this._getOperationTime(currEntitlementGR, action);
        var entitlementName = currEntitlementGR.getValue("name");

        var gr = new GlideRecord(this.SUBSCRIPTION_ENTITLEMENT_AUDIT_LOG);
        if (!gr.isValid())
            return;
        gr.setValue("time_stamp", opTime);
        gr.setValue("subscription", currEntitlementGR.getValue("sys_id"));
        gr.setValue("action", action);
        gr.setValue("new_purchased_count", currEntitlementGR.getValue("purchased_count"));
        gr.setValue("new_start_date", currEntitlementGR.getValue("start_date"));
        gr.setValue("new_end_date", currEntitlementGR.getValue("end_date"));
        gr.setValue("previous_subscription", serializedPrevEntitlement);

        var auditRec = gr.insert();

        if (global.LicensingScriptUtil.nil(auditRec))
            GlideLog.error("Subscription Audit Log failed for license: " + entitlementName);
    },

    _getOperationTime: function(currEntitlementGR, action) {

        if (action === this.CREATED)
            return currEntitlementGR.getValue("sys_created_on");
        else if (action === this.UPDATED)
            return currEntitlementGR.getValue("sys_updated_on");
        else
            return new GlideDateTime().getValue();

    },

    _validateAuditInput: function(currEntitlementGR, action) {

        if (global.LicensingScriptUtil.nil(currEntitlementGR)) {
            gs.error("Skipping Subscription Audit Log for subscription " + action + "operation because GlideRecord object is null");
            return false;
        }

        if (global.LicensingScriptUtil.nil(action)) {
            gs.error("Skipping Subscription Audit Log for subscription " + currEntitlementGR.name + "because operation is unknown");
            return false;
        }

        return true;
    },

    type: 'EntitlementAuditHelper'
};
