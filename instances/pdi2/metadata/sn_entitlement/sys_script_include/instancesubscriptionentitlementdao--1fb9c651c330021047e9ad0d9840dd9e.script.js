var InstanceSubscriptionEntitlementDAO = Class.create();
InstanceSubscriptionEntitlementDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.licensingEngineCommonUtil = new LicensingEngineCommonUtil();
        this.environment = sn_entitlement.LicensingEngineConstants.ENTITLEMENT_MODEL_ENVIRONMENT;
        this.instanceOption = sn_entitlement.LicensingEngineConstants.ENTITLEMENT_MODEL_INSTANCE_OPTIONS;
        this.instances = sn_entitlement.LicensingEngineConstants.ENTITLEMENT_MODEL_INSTANCES;
        this.entitlementModel = sn_entitlement.LicensingEngineDBConstants.ENTITLEMENT_MODEL;
    },

    /**
     * Insert/Update into instance_subscription_entitlement
     *
     * Update HostingType, Name and EntitlementModel based on entitlementLevel
     *
     * @param {string} entitlementLevel - "instance level" or "account level"
     * @param {object} cloudEntitlementObj - entitlement entry of Environment, Instance or Instance Options
     */
    insertOrUpdateInstanceSubEntRecord: function(entitlementLevel, cloudEntitlementObj) {
        try {
            let instanceSubEnt = new GlideRecord(LicensingEngineDBConstants.INSTANCE_SUBSCRIPTION_ENTITLEMENT);
            instanceSubEnt.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, cloudEntitlementObj.entitlement_id);
            instanceSubEnt.query();
            const recordExists = instanceSubEnt.next();

            let instanceSubscriptionEntitlementGR = new GlideRecord(LicensingEngineDBConstants.INSTANCE_SUBSCRIPTION_ENTITLEMENT);
            instanceSubscriptionEntitlementGR.initialize();
            if (recordExists)
                instanceSubscriptionEntitlementGR = instanceSubEnt;

            instanceSubscriptionEntitlementGR.customer_name = cloudEntitlementObj.customer_name;
            instanceSubscriptionEntitlementGR.start_date = this.licensingEngineCommonUtil.getDate(cloudEntitlementObj.start_date);
            instanceSubscriptionEntitlementGR.end_date = this.licensingEngineCommonUtil.getDate(cloudEntitlementObj.end_date);
            instanceSubscriptionEntitlementGR.entitlement_id = cloudEntitlementObj.entitlement_id;
            instanceSubscriptionEntitlementGR.parent_entitlement_id = cloudEntitlementObj.parent_entitlement_id;
            instanceSubscriptionEntitlementGR.product_code = cloudEntitlementObj.product_code;
            instanceSubscriptionEntitlementGR.purchased_quantity = cloudEntitlementObj.purchased_count;
            instanceSubscriptionEntitlementGR.storage_capacity = cloudEntitlementObj.storage_capacity;
            instanceSubscriptionEntitlementGR.status = this.licensingEngineCommonUtil.getChoiceValue(LicensingEngineDBConstants.STATUS, this.licensingEngineCommonUtil.toLowerCase(cloudEntitlementObj.status));
            instanceSubscriptionEntitlementGR.meter_type = cloudEntitlementObj.meter_type;
            instanceSubscriptionEntitlementGR.definition_id = cloudEntitlementObj.definition_id || "";

            let entModel = "";
            let hostingType = "";
            let name = cloudEntitlementObj.product_name;

            if (LicensingEngineConstants.ENTITLEMENT_TYPE_INSTANCE_LEVEL.equals(entitlementLevel)) {
                entModel = cloudEntitlementObj.entitlement_model_name;
                hostingType = global.LicensingScriptUtil.notNil(cloudEntitlementObj.hosting_type) ? cloudEntitlementObj.hosting_type : "";

                // if entitlement_model_name is null we are receiving data for Instance Options (instance level for the logged-in instance), take data from entitlement_model and offering_name
                if (global.LicensingScriptUtil.nil(entModel) && cloudEntitlementObj.entitlement_model == LicensingEngineConstants.ENTITLEMENT_MODEL_INSTANCE_OPTIONS) {
                    name = cloudEntitlementObj.offering_name;
                    entModel = cloudEntitlementObj.entitlement_model;
                }

            } else if (LicensingEngineConstants.ENTITLEMENT_TYPE_ACCOUNT_LEVEL.equals(entitlementLevel)) {
                name = cloudEntitlementObj.offering_name;
                entModel = cloudEntitlementObj.entitlement_model;

                // HostingType coming as part of Instance Options (account_entitlement for a different instance under the same account) entry will be set already use it if its not null, else derive
                hostingType = global.LicensingScriptUtil.notNil(cloudEntitlementObj.hosting_type) ? cloudEntitlementObj.hosting_type : this.getHostingTypeForAccountLevelEntitlement(entModel, cloudEntitlementObj.storage_capacity);
            }

            instanceSubscriptionEntitlementGR.name = name;
            instanceSubscriptionEntitlementGR.entitlement_model = entModel;
            instanceSubscriptionEntitlementGR.hosting_type = this.licensingEngineCommonUtil.getChoiceValue(LicensingEngineDBConstants.HOSTING_TYPE, this.licensingEngineCommonUtil.toLowerCase(hostingType));

            if (recordExists)
                return instanceSubscriptionEntitlementGR.update();
            else
                return instanceSubscriptionEntitlementGR.insert();
        } catch (ex) {
            this.logger.logErrorWithoutAudit(this.type, "insertOrUpdateInstanceSubEntRecord", "Encountered an exception while populationg instance_subscription_entitlement : " + ex.message);
        }
    },

    // Returns hosting type for account level cloud entitlements using the entitlement model
    getHostingTypeForAccountLevelEntitlement: function(entModel, storageCapacity) {
        if (entModel == LicensingEngineConstants.ENTITLEMENT_MODEL_ENVIRONMENT)
            return LicensingEngineConstants.HOSTING_TYPE_DEDICATED;
        else if (entModel == LicensingEngineConstants.ENTITLEMENT_MODEL_INSTANCE_OPTIONS && storageCapacity != '0')
            return LicensingEngineConstants.HOSTING_TYPE_SHARED;
        else
            return "";
    },
    /**
     * Marks orphaned cloud entitlements as inactive.
     * his function compares received entitlement IDs with existing records in the
     * instance_subscription_entitlement table. Based on the entitlement level, it filters records by:
     * - Instance-level: entitlement_model = "instances"
     * - Account-level: entitlement_model = "instance_options" OR "environment"
     * It processes only entitlements with status in DEFAULT_STATUS_TO_CHECK (Active & Expired),
     * excluding the ones received in the current sync. All unmatched entitlements are considered orphans
     * and are marked as Inactive and entitlement IDs are logged.
     * @param {Array}   cloudEntitlementsReceived - List of entitlement IDs received in the sync.
     * @param {Boolean} isAccountLevel - Indicates whether the entitlements are account-level.
     */
    markOrphanCloudEntitlementsInactive: function(cloudEntitlementsReceived, isAccountLevel = false) {
        var cloudSubscriptionGR = new GlideRecord(LicensingEngineDBConstants.INSTANCE_SUBSCRIPTION_ENTITLEMENT); // Query instance_subscription_entitlement table

        // Filter by entitlement_model depending on Entitlement level
        if (isAccountLevel) {
            // For account-level: include both "Instance Options" and "Environment"
            const query = `${this.entitlementModel}=${this.instanceOption}^OR${this.entitlementModel}=${this.environment}`;
            cloudSubscriptionGR.addEncodedQuery(query);
        } else {
            // For instance-level: only include "Instances"
            cloudSubscriptionGR.addQuery(this.entitlementModel, '=', this.instances);
        }
        cloudSubscriptionGR.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK); // Filter only active & Expired status records
        cloudSubscriptionGR.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, LicensingEngineDBConstants.NOT_IN, cloudEntitlementsReceived); // Exclude received/processed entitlements to identify orphans
        cloudSubscriptionGR.query();

        var orphanCloudEntitlementIds = [];
        // Mark all orphaned entitlements as inactive
        while (cloudSubscriptionGR.next()) {
            cloudSubscriptionGR.setValue(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.ENTITLEMENT_STATUS.INACTIVE);
            cloudSubscriptionGR.update();
            orphanCloudEntitlementIds.push(cloudSubscriptionGR.getValue(LicensingEngineDBConstants.ENTITLEMENT_ID));
        }
        if (global.LicensingScriptUtil.notNil(orphanCloudEntitlementIds) && !global.LicensingScriptUtil.isEmpty(orphanCloudEntitlementIds)) {
            this.logger.logWarn(this.type, "markOrphanCloudEntitlementsInactive", "Orphaned Cloud entitlement(s) marked inactive, entitlement Id(s): " + orphanCloudEntitlementIds);
        }
    },

    type: 'InstanceSubscriptionEntitlementDAO'
};
