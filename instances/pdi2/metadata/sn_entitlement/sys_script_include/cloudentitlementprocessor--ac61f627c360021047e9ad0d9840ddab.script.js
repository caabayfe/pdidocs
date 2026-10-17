var CloudEntitlementProcessor = Class.create();
CloudEntitlementProcessor.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.instanceSubEntDAO = new InstanceSubscriptionEntitlementDAO();
        this.accountSubEntDAO = new AccountSubscriptionEntitlementDAO();
        this.arrayUtil = new global.LicensingScriptUtil();
        this.licensingEngineCommonUtil = new LicensingEngineCommonUtil(); 
		},

    /**
     * Populates instance level cloud entitlements that are downloaded as part of EntitlementsDisplayDownloader job (getEntitlementsForAccount API)
     *
     * Insert into instance_subscription_entitlement and account_subscription_entitlement only if an entry is present in sn_mif_instance
     *
     * @param {array} cloudEntitlementList - contains EntitlementModelName: Instances, for the logged-in instance's account
     */
    populateInstanceLevelEntitlements: function(cloudEntitlementList) {
        if (gs.nil(cloudEntitlementList)) {
            this.logger.logWarn(this.type, "populateInstanceLevelEntitlements", "Cloud Entitlement details payload is empty");
            return;
        }
        var receivedCloudInstanceLevelEntitlements =[]; //maintain the received entitlements to identify any orphan entitlement

        cloudEntitlementList.forEach((cloudEntitlementObj) => {
            // Check if either ids or names is null then skip the entitlement
            if (global.JSUtil.nil(cloudEntitlementObj.instance_ids) || global.JSUtil.nil(cloudEntitlementObj.instance_names)) {
                this.logger.logWarn(this.type, "populateInstanceLevelEntitlements",
                    "Skipping entitlement due to null or empty instance_ids or instance_names");
                return;
            }

            const instanceIds = cloudEntitlementObj.instance_ids.split(',');
            const instanceNames = cloudEntitlementObj.instance_names.split(',');

            if (instanceIds.length === instanceNames.length) {
                for (const i in instanceIds) {
                    /**
                     * Check if instance have mif enabled, only then populate.
                     * Rationale behind this is to avoid having record in account_subscription_entitlement which do not have reference to any instance which would then be treated as an account level entitlement and can be confusing.
                     */
                    if (this.checkInstanceHasMIF(instanceIds[i])) {
                        receivedCloudInstanceLevelEntitlements.push(cloudEntitlementObj.entitlement_id);
                        const recordSysID = this.instanceSubEntDAO.insertOrUpdateInstanceSubEntRecord(LicensingEngineConstants.ENTITLEMENT_TYPE_INSTANCE_LEVEL, cloudEntitlementObj);
                        this.accountSubEntDAO.insertAccountSubEntRecord(recordSysID, instanceIds[i]);
                    } else
                        this.logger.logWarn(this.type, "populateInstanceLevelEntitlements", "Skipping cloud entitlement population for instance : " + instanceNames[i]);

                }
            }
        });
        this.instanceSubEntDAO.markOrphanCloudEntitlementsInactive(receivedCloudInstanceLevelEntitlements,false); //Mark instance-level cloud entitlements as inactive
    },

    /**
     * Populates account level cloud entitlements that are downloaded as part of LicensingEngine job
     *
     * Process the records whose status is one of Active, Inactive and Expired
     *
     * This method gets called for the below Entitlement Models, we consider all the below at an account level
     * 	- Environment (account level)
     *  - Instance Options (account level)
     * 	- Instance Options (instance level for the logged-in instance)
     *  - Instance Options (account_entitlement for a different instance under the same account)
     *
     * @param {object} entitlementObj - Environment or Instance Options Entitlement object
     */
    populateAccountLevelEntitlements: function(entitlementObj) {
        if (!this.arrayUtil.contains(LicensingEngineConstants.CLOUD_STATUS_TO_PROCESS, this.licensingEngineCommonUtil.toLowerCase(entitlementObj.status)))
            return;

        // For Instance Options (instance level for the logged-in instance) do additional check of storage_capacity > 0 before inserting
        if (LicensingEngineConstants.ENTITLEMENT_TYPE_INSTANCE_LEVEL.equals(entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE]) && parseInt(entitlementObj.storage_capacity) <= 0)
            return;

        const recordSysID = this.instanceSubEntDAO.insertOrUpdateInstanceSubEntRecord(entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE], entitlementObj);
        this.accountSubEntDAO.insertAccountSubEntRecord(recordSysID, "");
    },

    /**
     * Validates if the entry is present in sn_mif_instance or not. If not present, the instance is running on SMV2.0 or lower where MIF app is not installed.
     *
     * @param {string} instanceID
     */
    checkInstanceHasMIF: function(instanceID) {
        let mifInstanceGR = new GlideRecord(LicensingEngineDBConstants.SN_MIF_INSTANCE);
        mifInstanceGR.addQuery(LicensingEngineDBConstants.INSTANCE_ID, instanceID);
        mifInstanceGR.query();
        if (mifInstanceGR.hasNext())
            return true;
        return false;
    }, 

    type: 'CloudEntitlementProcessor'
};
