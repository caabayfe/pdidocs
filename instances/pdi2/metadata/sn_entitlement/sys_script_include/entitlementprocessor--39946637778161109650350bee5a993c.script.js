var EntitlementProcessor = Class.create();
EntitlementProcessor.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.arrayUtil = new global.LicensingScriptUtil();
        this.metaDataBuilder = new EntitlementMetaDataBuilder();
        this._entitlementUtils = new sn_lef.EntitlementEngineUtils();
        this.licensingEngineCommonUtil = new LicensingEngineCommonUtil();
        this.cloudEntitlementProcessor = new CloudEntitlementProcessor();
        this.instanceSubEntDAO = new InstanceSubscriptionEntitlementDAO();
        this.subscriptionEntitlementMap = {}; // key: subscription EID , value: subscription obj
        this.applicationEntitlementMap = {}; // key: application EID , value:  application obj
        this.subscriptionToAppList = {}; // key: subscription EID , value: [list of application obj]
        this.dynamicPackageEntitlementArray = []; // holds list of EID of Dynamic Package(Parent) entitlement model
        this.subscriptionToMetadataObjList = {}; // key: subscription EID , value: [list of metadata obj]
        this.custTblAllotGrandfatherTypeEntID = '';
        this.lineItemsEntitlementsObj = {}; // key: line item subscription EID , value: subscription obj
        this.explicitEntitlementMap = {}; // key: unique product key, value: explicit entitlements obj]
        this.impactPackageL1EntitlementArray = []; // holds list of EID of Package and Add on Package entitlement model
        /**
         * Creating this for Custom Tables
         * key: ParentEntitlementID (subscription_entitlement.parent_entitlement_id)
         * value: {
         * 	sysId: subscription_entitlement.sys_id,
         *  entitlementId: subscription_entitlement.entitlement_id
         *  numberOfTables: Quantity (No of Custom Tables),
         *  allotmentType: AllotmentType (MDM)
         * }
         */
        this.entitlementIdToCustAllotmentObj = {};

        this.recordSysId = "";
        this.missingMandatoryAttr = "";
        this.licDebugLog = gs.getProperty(LicensingEngineConstants.PROP_COM_GLIDE_LICENSING_DEBUG, false);

        this.result = {};

        this.MDM_PRODUCT_DETAILS = 'mdm_product_details';
        this.PRODUCT_ATTRIBUTE = 'product_attribute';
        this.PRODUCT_METADATA = 'product_metadata';
        this.EXPLICIT_ENTITLEMENT = "explicit_entitlements";
        this.FEATURES = 'features';
        this.PLUGIN_LIST = 'plugin_list';

        //error code names
        this.NO_ATTACHMENT = "LIC1001";
        this.TRANSFORMER_ERROR = "LIC1002";
        this.NO_ENTITLEMENTS = "LIC1003";
        this.MANDATORY_ATTR_MISSING = "LIC1004";
        this.NO_SUBSCRIPTION_ENTITLEMENTS = "LIC1005";
        this.ENTITLEMENT_PROCESSING_ERROR = "LIC1006";
    },

    /**
     * retrieves entitlement payload attachment and transformes to subscription_entitlememt equivalent objects
     * to populate SMv2 related tables
     *
     * @returns {result} object representing status and error message(if any) after processing
     */
    processEntitlementPayload: function() {
        try {
            this.processEntitlements();
            if (Object.keys(this.result).length > 0) {
                return this.result; // Stop execution if processEntitlements returned a result
            }
            //populate data
            this.populateSubscriptionEntitlements();
            var appFamProcessor = new EntitlementAppFamilyProcessor(this.subscriptionToAppList);
            appFamProcessor.processApplicationEntitlements();
            this.populateMetadataEntitlements();

            // Populate CTI Information - plat_lic_exemption, license_cust_table_allotment, ua_cust_tbl_entitlement
            var ctiProcessor = new CustomTableInventoryProcessor(this.entitlementIdToCustAllotmentObj);
            if (!new LicensingEngineCommonUtil().isSelfHostedInstanceWithEntitlementSupport()) {
                ctiProcessor.downloadAndProcessExemptedEntities(appFamProcessor.validSubscriptionFamilies);
            }
            ctiProcessor.populateCTAllotmentAndEntitlement();

            // Add/Remove entries to/from ua_custom_table_inventory/ua_exempted_table_inventory and reload the cache
            this._entitlementUtils.platLicPostProcess();

        } catch (e) {
            var errorMesg = LicensingEngineConstants.LICENSING_ERROR_CODES[this.ENTITLEMENT_PROCESSING_ERROR] + e + " \n " + e.stack;
            this._setResult(LicensingEngineDBConstants.STATUS_VALUE.ERROR, errorMesg, this.ENTITLEMENT_PROCESSING_ERROR, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_PROCESSING, 'processEntitlementPayload', this.type);
            return this.result;
        }

        this._setResult(LicensingEngineDBConstants.STATUS_VALUE.PROCESSED, "No error", "", "", "", "");
        return this.result;
    },

    processEntitlements: function(attachmentID, recordId) {
        try {
            //get entitlement payload attachment
            var attachmentSysID;
            if (!attachmentID) {
                attachmentSysID = this.getAttachmentSysId(LicensingEngineDBConstants.INSTANCE_LEVEL);
            } else {
                attachmentSysID = attachmentID;
                this.recordSysId = recordId;
            }

            var util = this._entitlementUtils;
            if (global.LicensingScriptUtil.nil(attachmentSysID) && typeof util.saveAttachmentFromString == 'function') {
                this._setResult(LicensingEngineDBConstants.STATUS_VALUE.ERROR, LicensingEngineConstants.LICENSING_ERROR_CODES[this.NO_ATTACHMENT], this.NO_ATTACHMENT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_PROCESSING, 'processEntitlements', this.type);
                return this.result;
            }
            //apply transformation and get list of entitlement objects
            try {
                var entitlementList = this.getPayloadToTransformedEntitlementList(this.recordSysId, attachmentSysID);
            } catch (error) {
                const errorMesg = LicensingEngineConstants.LICENSING_ERROR_CODES[this.TRANSFORMER_ERROR] + error + " \n " + error.stack;
                this._setResult(LicensingEngineDBConstants.STATUS_VALUE.ERROR, errorMesg, this.TRANSFORMER_ERROR, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_PROCESSING, "processEntitlements", this.type);
                return this.result;
            }

            if (this.licDebugLog == 'true')
                this.logger.logInfo(this.type, "processEntitlements", "Transformed Entitlement List : " + JSON.stringify(entitlementList));

            if (global.LicensingScriptUtil.nil(entitlementList) || global.LicensingScriptUtil.isEmpty(entitlementList)) {
                this._setResult(LicensingEngineDBConstants.STATUS_VALUE.ERROR, LicensingEngineConstants.LICENSING_ERROR_CODES[this.NO_ENTITLEMENTS], this.NO_ENTITLEMENTS, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_PROCESSING, "processEntitlements", this.type);
                return this.result;
            }
            var receivedCloudAccountLevelEntitlements = []; //maintain the received Cloud entitlements to identify any orphan entitlement

            for (var i = 0; i < entitlementList.length; i++) {
                var entitlementObj = entitlementList[i];

                if (global.LicensingScriptUtil.notNil(entitlementObj)) {
                    //check for any null or empty values for EMS mandatory fields that are relavent to SMv2, stop processing if not present
                    if (this.isMandatoryAttrValueMissing(entitlementObj)) {
                        const missingAttrEntitleID = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_ID]) ? entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_ID] : "";
                        const errMesg = LicensingEngineConstants.LICENSING_ERROR_CODES[this.MANDATORY_ATTR_MISSING] + "Missing Attribute is " + this.missingMandatoryAttr + " of entitlement with entitlement ID " + missingAttrEntitleID;
                        this._setResult(LicensingEngineDBConstants.STATUS_VALUE.ERROR, errMesg, this.MANDATORY_ATTR_MISSING, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_PROCESSING, "processEntitlements", this.type);
                        return this.result;
                    }
                    //process each entitlement based on the entitlement model name
                    var entitlementModel = entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL];
                    if (this.arrayUtil.contains(LicensingEngineConstants.SUBSCRIPTION_TYPE_MODEL_NAMES, entitlementModel))
                        this.processSubscriptionEntitlements(entitlementObj);
                    else if (this.arrayUtil.contains(LicensingEngineConstants.APPLICATION_TYPE_MODEL_NAMES, entitlementModel))
                        this.processApplicationEntitlements(entitlementObj);
                    else if (this.arrayUtil.contains(LicensingEngineConstants.ACCOUNT_LEVEL_CLOUD_ENTITLEMENT_MODEL_NAMES, entitlementModel)) {
                        this.cloudEntitlementProcessor.populateAccountLevelEntitlements(entitlementObj);
                        receivedCloudAccountLevelEntitlements.push(entitlementObj.entitlement_id);
                    }

                }
            }
            this.instanceSubEntDAO.markOrphanCloudEntitlementsInactive(receivedCloudAccountLevelEntitlements, true); //true indicates these are account-level entitlements

            this.recalculateEndDateGrandfatherSubscription();

            //recalculate entitlement model for second-level subscriptions
            this.processAndModifyChildEntitlementsOfSubscriptions();

            //add explicit entitlement data for app
            this.addExplicitEntitlement();
            //get apps for each subscription - handles app->app mapping as well
            this.buildSubscriptionToAppMap();


            if (global.LicensingScriptUtil.nil(this.subscriptionEntitlementMap) || global.LicensingScriptUtil.isEmpty(this.subscriptionEntitlementMap)) {
                this._setResult(LicensingEngineDBConstants.STATUS_VALUE.ERROR, LicensingEngineConstants.LICENSING_ERROR_CODES[this.NO_SUBSCRIPTION_ENTITLEMENTS], this.NO_SUBSCRIPTION_ENTITLEMENTS, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_PROCESSING, "processEntitlements", this.type);
                return this.result;
            }

            //log subscription, family and metadata entitlements before consolidations
            if (this.licDebugLog == 'true') {
                this.logger.logInfo(this.type, "processEntitlements", "Subscription entitlements before consolidation  : " + JSON.stringify(this.subscriptionEntitlementMap));
                this.logger.logInfo(this.type, "processEntitlements", "App Family entitlements before consolidation  : " + JSON.stringify(this.subscriptionToAppList));
                this.logger.logInfo(this.type, "processEntitlements", "Metadata entitlements before consolidation  : " + JSON.stringify(this.subscriptionToMetadataObjList));
            }

            // subscription consolidation
            this.consolidateEntitlements();
        } catch (e) {
            var errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[this.ENTITLEMENT_PROCESSING_ERROR] + e + " \n " + e.stack;
            this._setResult(LicensingEngineDBConstants.STATUS_VALUE.ERROR, errorMsg, this.ENTITLEMENT_PROCESSING_ERROR, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_PROCESSING, 'processEntitlements', this.type);
            return this.result;
        }

    },

    /**
     * Iterates over subscriptionEntitlementMap to set entitlement model for
     *  1.children of DP entitlement to 'Secondary Subscription'
     *  2.children of 'Package' and 'Add on Package' to 'Impact Subscription'
     */
    processAndModifyChildEntitlementsOfSubscriptions: function() {
        for (var id in this.subscriptionEntitlementMap) {
            let subEntitlementObj = this.subscriptionEntitlementMap[id];
            const parentId = subEntitlementObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID];
            if (this.arrayUtil.contains(this.dynamicPackageEntitlementArray, parentId))
                subEntitlementObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE] = LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.SECONDARY_SUBSCRIPTION;
            else if ((this.arrayUtil.contains(this.impactPackageL1EntitlementArray, parentId)))
                subEntitlementObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE] = LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.IMPACT_SUBSCRIPTION;
        }
    },

    /**
     * generates subscription_entitlement equivalent objects
     */
    processSubscriptionEntitlements: function(entitlementObj) {
        var subscriptionObj = {};

        var displayType = this._extractBOMExclusionType(entitlementObj[LicensingEngineDBConstants.DISPLAY_TYPE]);
        if (global.LicensingScriptUtil.notNil(displayType) && displayType == LicensingEngineConstants.EMS_DISPLAY_TYPES.IE)
            return;


        var mdmProductDetails = entitlementObj[this.MDM_PRODUCT_DETAILS];
        var productAttrObj = {};
        var productMetadataList = [];
        var productExplicitEntitlement = [];
        if (global.LicensingScriptUtil.notNil(mdmProductDetails)) {
            productAttrObj = this.getProductAttributes(mdmProductDetails[this.PRODUCT_ATTRIBUTE]);
            productMetadataList = mdmProductDetails[this.PRODUCT_METADATA];
            productExplicitEntitlement = mdmProductDetails[this.EXPLICIT_ENTITLEMENT];
        }
        var featuresObj = this.getFeatures(entitlementObj[this.FEATURES]);
        var entitlementID = entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
        var subscriptionType = "";
        //For Dynamic package SKU we won't have product data from MDM ,Attributes dependent on product data will be
        //derived from EMS data for Dynamic package model (for vancouver we support Unrestricted_User meter type only)
        let isDynamicPackageEntitlement = entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL] == LicensingEngineConstants.DYNAMIC_PACKAGE;
        if (isDynamicPackageEntitlement)
            this.dynamicPackageEntitlementArray.push(entitlementID);
        const entitlementModelName = entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL];
        subscriptionObj[LicensingEngineDBConstants.NAME] = entitlementObj[LicensingEngineDBConstants.NAME];
        subscriptionObj[LicensingEngineDBConstants.START_DATE] = this.getDate(entitlementObj[LicensingEngineDBConstants.START_DATE]);
        subscriptionObj[LicensingEngineDBConstants.END_DATE] = this.getDate(entitlementObj[LicensingEngineDBConstants.END_DATE]);
        if (isDynamicPackageEntitlement)
            subscriptionType = this.getSubscriptionTypeForDynamicPackage(entitlementObj[LicensingEngineDBConstants.METER_TYPE]);
        else
            subscriptionType = this.getSubscriptionType(productAttrObj, displayType);
        if (subscriptionType == LicensingEngineDBConstants.SUBSCRIPTION_TYPE_VALUE.UNRESTRICTED_USER)
            entitlementObj[LicensingEngineDBConstants.DEFINITION_ID] = LicensingEngineConstants.UNRESTRICTED_USER_DEFINITION_ID;
        subscriptionObj[LicensingEngineDBConstants.SUBSCRIPTION_TYPE] = subscriptionType;
        subscriptionObj[LicensingEngineDBConstants.CATEGORY] = isDynamicPackageEntitlement ? LicensingEngineDBConstants.CATEGORY_VALUE.SERVICENOW : this.getCategory(productAttrObj);
        subscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID] = entitlementID;
        subscriptionObj[LicensingEngineDBConstants.PURCHASED_COUNT] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.PURCHASED_COUNT]) ? entitlementObj[LicensingEngineDBConstants.PURCHASED_COUNT] : "";
        subscriptionObj[LicensingEngineDBConstants.PRODUCT_CODE] = entitlementObj[LicensingEngineDBConstants.PRODUCT_CODE];
        subscriptionObj[LicensingEngineDBConstants.FOR_FEE] = this.getForFee(entitlementObj[LicensingEngineDBConstants.SUPPORT_APP]);
        subscriptionObj[LicensingEngineDBConstants.STATUS] = this.getStatus(entitlementObj[LicensingEngineDBConstants.STATUS]);
        subscriptionObj[LicensingEngineDBConstants.FGE_IDS] = featuresObj[LicensingEngineDBConstants.FGE_IDS];
        subscriptionObj[LicensingEngineDBConstants.DASHBOARD_ID] = featuresObj[LicensingEngineDBConstants.DASHBOARD_ID];
        subscriptionObj[LicensingEngineDBConstants.DEFINITION_ID] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.DEFINITION_ID]) ? entitlementObj[LicensingEngineDBConstants.DEFINITION_ID] : "";
        subscriptionObj[LicensingEngineDBConstants.QUOTA_DEFN] = new sn_lef.EntitlementEngineUtils().getQuotaDefinition(entitlementObj[LicensingEngineDBConstants.DEFINITION_ID]);
        // Display type of Impact entitlements to be set as hide for Y release, once EMS payload provides the BOM exclusion type value for IMPACT entitlements, this IMPACT_ENTITLEMENT_MODEL_NAMES check will be removed.
        subscriptionObj[LicensingEngineDBConstants.DISPLAY_TYPE] = this.arrayUtil.contains(LicensingEngineConstants.IMPACT_ENTITLEMENT_MODEL_NAMES, entitlementModelName) ? LicensingEngineConstants.DISPLAY_TYPE.HIDE :
            this.getDisplayType(entitlementObj[LicensingEngineDBConstants.DISPLAY_TYPE]);
        subscriptionObj[LicensingEngineDBConstants.UNIT_OF_METER] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.UNIT_OF_METER]) ? entitlementObj[LicensingEngineDBConstants.UNIT_OF_METER] : "";
        subscriptionObj[LicensingEngineDBConstants.METER_TYPE] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.METER_TYPE]) ? entitlementObj[LicensingEngineDBConstants.METER_TYPE] : "";
        subscriptionObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID]) ? entitlementObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID] : "";
        subscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE] = this.getEntitlementModel(entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL]);
        subscriptionObj[LicensingEngineDBConstants.MEASURED_ROLE_TYPES] = this.getMeasuredRoleType(productAttrObj, subscriptionType);
        subscriptionObj[LicensingEngineDBConstants.PRODUCTION_INSTANCE_NAMES] = entitlementObj[LicensingEngineConstants.INSTANCE_NAME];
        subscriptionObj[LicensingEngineDBConstants.UNIQUE_KEY] = entitlementObj[LicensingEngineDBConstants.UNIQUE_KEY];
        subscriptionObj[LicensingEngineDBConstants.SUBCLASS_TYPE] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.SUBCLASS_TYPE]) ? entitlementObj[LicensingEngineDBConstants.SUBCLASS_TYPE] : "";
        subscriptionObj[LicensingEngineDBConstants.SUBSCRIPTION_IDENTIFIER] = this.getSubscriptionIdentifier(subscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID], subscriptionObj[LicensingEngineDBConstants.DEFINITION_ID]);
        subscriptionObj[LicensingEngineDBConstants.PACKAGE_TYPE] = global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.PACKAGE_TYPE]) ? productAttrObj[LicensingEngineConstants.PACKAGE_TYPE] : "";
        subscriptionObj[LicensingEngineDBConstants.PROGRAM_TYPE] = global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.PROGRAM_TYPE]) ? productAttrObj[LicensingEngineConstants.PROGRAM_TYPE] : "";
        subscriptionObj[LicensingEngineDBConstants.PRODUCT_FAMILY_3] = global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.PRODUCT_FAMILY_3]) ? productAttrObj[LicensingEngineConstants.PRODUCT_FAMILY_3] : "";

        if (LicensingEngineConstants.INSTANCE_NAME in entitlementObj)
            subscriptionObj[LicensingEngineDBConstants.PRODUCTION_INSTANCE_NAMES] = entitlementObj[LicensingEngineConstants.INSTANCE_NAME];
        else
            subscriptionObj[LicensingEngineDBConstants.PRODUCTION_INSTANCE_NAMES] = "";

        // Subscriptions -> Transactions (Custom Tables). For EntitlementModelName as Transactions the parent will be Subscriptions. There is only one layer above 'Transactions' which is 'Subscriptions'
        if (entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL] == LicensingEngineConstants.TRANSACTIONS && entitlementObj[LicensingEngineDBConstants.SUBCLASS_TYPE] == LicensingEngineConstants.CUSTOM_TABLES) {
            const allotmentType = this.metaDataBuilder.getValueFromMetadataListByKey(productMetadataList, LicensingEngineConstants.CUSTOMTABLE_ALLOTMENT, LicensingEngineConstants.ALLOTMENT_TYPE);
            // we are not using number Of Columns anywhere for the calculation
            if (allotmentType === LicensingEngineConstants.ALLOTMENT_TYPES.GRANDFATHER)
                this.custTblAllotGrandfatherTypeEntID = subscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];

            const customTableAllotment = {
                'sysId': '-1',
                'entitlementId': subscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID],
                'numberOfTables': subscriptionObj[LicensingEngineDBConstants.PURCHASED_COUNT],
                'allotmentType': allotmentType
            };
            this.entitlementIdToCustAllotmentObj[subscriptionObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID]] = customTableAllotment; // It will be updated during insert
        }
        /*
        Impact entitlements structure
        	Package (L1) 	
        		Child entitlement models(L2) {model = Learning Credits, Instance Observer etc.} 
        	Add On Package (L1) 
        		Child entitlement models(L2) {model = Learning Credits, Instance Observer etc.}
        	Preventive Care (L1)  - will not have any children as of Y release 
        */
        //l1 entitlements  will be saved as 'primary_subscription', l2 entitlements will be saved as 'impact_subscription'
        if (this.arrayUtil.contains(LicensingEngineConstants.IMPACT_L1_PACKAGE_ENTITLEMENT_MODEL_NAMES, entitlementModelName)) {
            this.impactPackageL1EntitlementArray.push(entitlementID);
            subscriptionObj[LicensingEngineDBConstants.PACKAGE] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.PACKAGE]) ? entitlementObj[LicensingEngineDBConstants.PACKAGE] : "";
        }
        //Set impact-specific attributes for impact entitlements only 
        if (this.arrayUtil.contains(LicensingEngineConstants.IMPACT_ENTITLEMENT_MODEL_NAMES, entitlementModelName)) {
            subscriptionObj[LicensingEngineDBConstants.ACCELERATOR_SUB_CATALOGS] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.ACCELERATOR_SUB_CATALOGS]) ? JSON.stringify(entitlementObj[LicensingEngineDBConstants.ACCELERATOR_SUB_CATALOGS]) : "";
            subscriptionObj[LicensingEngineDBConstants.PRODUCT_ACCESS_LEVEL] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.PRODUCT_ACCESS_LEVEL]) ? entitlementObj[LicensingEngineDBConstants.PRODUCT_ACCESS_LEVEL] : "";
            subscriptionObj[LicensingEngineDBConstants.PROPOSED_FIX] = global.LicensingScriptUtil.notNil(entitlementObj[LicensingEngineDBConstants.PROPOSED_FIX]) ? entitlementObj[LicensingEngineDBConstants.PROPOSED_FIX] : "";
        }
        subscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL] = entitlementModelName;

        this.subscriptionEntitlementMap[entitlementID] = subscriptionObj;

        // process the metadata (IH Spoke Caller Scope & Subscription Unit Ratio) of the product in subscritpion entitlement
        this.processMetadataEntitlements(entitlementID, productMetadataList, entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL]);

        // process the explicit entitlement for family product in subscription entitlement
        this.processExplicitEntitlements(productExplicitEntitlement, entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL]);
    },

    /**
     * processes  explicit entitlement for family product info of subscription entitlement
     * builds explicitEntitlementMap - key: {string} unique product key, value: {json_object} explicit entitlements details obj
     * where each explicit entitlements details obj has -
     * 		product_code: {string} mdm product code for family,
     * 		entitled_role_types: {array} List of entitled/licensed role types,
     * 		unrestricted_role_types: {array} List of unrestricted role types,
     * 		installable: {boolean} is family installable
     */
    processExplicitEntitlements: function(explicitEntitlement, entitlementModelName) {
        if (global.LicensingScriptUtil.nil(explicitEntitlement) || global.LicensingScriptUtil.isEmpty(explicitEntitlement))
            return;

        var explicitEntitlementsBuilder = new ExplicitEntitlementBuilder();
        var explicitEntsMap = explicitEntitlementsBuilder.getExplicitEntitlements(explicitEntitlement, entitlementModelName);

        if (global.LicensingScriptUtil.nil(explicitEntsMap) || global.LicensingScriptUtil.isEmpty(explicitEntsMap))
            return;

        Object.assign(this.explicitEntitlementMap, explicitEntsMap);
    },

    /**
     * processes metadata from product info of subscripiton entitlement as well as from plugin info of application entitlement
     * builds subscriptionToMetadataObjList - key: subscription EID , value: [list metadata objects]
     * where each metadata obj has 3 keys -
     * 		"type": ih_spoke_caller_scope or su_ratio or ih_spoke or ih_protocol
     * 		"column_values": comma separate list of metadata values
     * 		"subscription_item": entitlement id of subscription in subscription_entitlement_item
     * 		Ex: { "type": "su_ratio", "column_values": "SERVER,servers,3,ITOM AIOps Enterprise", "subscription_item": 1231312 }
     */
    processMetadataEntitlements: function(entitleID, metadataList, entitlementModelName) {
        if (global.LicensingScriptUtil.nil(entitleID) || global.LicensingScriptUtil.nil(metadataList) || global.LicensingScriptUtil.isEmpty(metadataList))
            return;

        var metadataBuilder = new EntitlementMetaDataBuilder();
        var metadataObjList = metadataBuilder.getMetadataObjList(metadataList, entitlementModelName);

        if (global.LicensingScriptUtil.nil(metadataObjList) || global.LicensingScriptUtil.isEmpty(metadataObjList))
            return;

        metadataObjList.forEach(obj => obj[LicensingEngineDBConstants.SUBSCRIPTION_ITEM] = entitleID);

        if (entitleID in this.subscriptionToMetadataObjList) {
            var existingMetadataList = this.subscriptionToMetadataObjList[entitleID];
            this.subscriptionToMetadataObjList[entitleID] = existingMetadataList.concat(metadataObjList);
        } else
            this.subscriptionToMetadataObjList[entitleID] = metadataObjList;
    },

    /**
     * populate subscription_entitlement table
     */
    populateSubscriptionEntitlements: function() {
        const emsEntitlements = [];
        for (var id in this.subscriptionEntitlementMap) {
            var existingGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            existingGR.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, id);
            existingGR.query();

            var sysId = '';
            if (existingGR.next()) {
                sysId = this.createEntitlementGR(existingGR, this.subscriptionEntitlementMap[id], false);
            } else {
                var newGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
                sysId = this.createEntitlementGR(newGR, this.subscriptionEntitlementMap[id], true);
            }
            emsEntitlements.push(id); //adding any existing entitlements to the array

            // Capture the SysId for the id (entitlementId)
            if (id in this.entitlementIdToCustAllotmentObj)
                this.entitlementIdToCustAllotmentObj[id].sysId = sysId;
        }

        this.logOrphanEntitlements(emsEntitlements);

        // populate all line item subscriptions without consolidation
        for (var entitleID in this.subscriptionEntitlementMap) {
            if (!(entitleID in this.lineItemsEntitlementsObj)) {
                const subEntitlementObj = this.subscriptionEntitlementMap[entitleID];
                subEntitlementObj[LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT] = entitleID;
                this.lineItemsEntitlementsObj[entitleID] = subEntitlementObj;
            }
        }

        this.populateLineItemSubscriptions();
    },

    /**
     * The function logs existing entitlements which are active and start/ end dates are current but not
     * part of the latest EMS payload.
     *
     * @param {array} existing entitlement ids which came as part of EMS payload
     *
     */
    logOrphanEntitlements: function(emsEntitlements) {
        var subscriptionEntitlementGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        subscriptionEntitlementGR.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, 'NOT IN', emsEntitlements);
        //Only consider active entitlements, complete list to be considered in future release
        subscriptionEntitlementGR.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        subscriptionEntitlementGR.query();
        var orphanEntitlementIds = [];
        while (subscriptionEntitlementGR.next()) {
            subscriptionEntitlementGR.setValue(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.ENTITLEMENT_STATUS.INACTIVE);
            subscriptionEntitlementGR.update();
            orphanEntitlementIds.push(subscriptionEntitlementGR.getValue(LicensingEngineDBConstants.ENTITLEMENT_ID));
        }
        if (global.LicensingScriptUtil.notNil(orphanEntitlementIds) && !global.LicensingScriptUtil.isEmpty(orphanEntitlementIds))
            this.logger.logWarn(this.type, "logOrphanEntitlements", "Orphaned entitlement(s) marked inactive, entitlement Id(s): " + orphanEntitlementIds);
    },

    /**
     * populate deleted subscriptions which are consolidated in subscription_entitlement table
     */
    populateLineItemSubscriptions: function() {
        // clean before inserting
        this._cleanTable(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT_ITEM);
        for (var id in this.lineItemsEntitlementsObj) {
            // get the sys_id for the parent_entitlement_id
            var existingGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
            existingGR.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, this.lineItemsEntitlementsObj[id][LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT]);
            existingGR.query();
            if (existingGR.next()) {
                this.lineItemsEntitlementsObj[id][LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT] = existingGR.getValue(LicensingEngineDBConstants.SYS_ID);
                this.createLineItemEntitlementGR(id, this.lineItemsEntitlementsObj[id]);
            } else {
                var parent_entitlement = this.findParentEntitlementId(this.lineItemsEntitlementsObj, this.lineItemsEntitlementsObj[id][LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT]);
                var subscriptionEntGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
                subscriptionEntGR.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, parent_entitlement);
                subscriptionEntGR.query();
                if (subscriptionEntGR.next()) {
                    this.lineItemsEntitlementsObj[id][LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT] = subscriptionEntGR.getValue(LicensingEngineDBConstants.SYS_ID);
                } else {
                    // parent_entitlement is the sys_id
                    this.lineItemsEntitlementsObj[id][LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT] = parent_entitlement;
                }
                this.createLineItemEntitlementGR(id, this.lineItemsEntitlementsObj[id]);
            }
        }
    },

    /**
     * finds the parent entitlement id for a line item subscription
     * @param {object} lineItemsEntitlementsObj - line item entitlement payload object
     * @param {string} id - line item subscription entitlement id
     * @returns {string} parent entitlement id
     */
    findParentEntitlementId: function(lineItemsEntitlementsObj, id) {
        var parent_entitlement = lineItemsEntitlementsObj[id]['subscription_entitlement'];
        if (id === parent_entitlement || !lineItemsEntitlementsObj[parent_entitlement]) {
            return parent_entitlement;
        } else {
            return this.findParentEntitlementId(lineItemsEntitlementsObj, parent_entitlement);
        }
    },

    createEntitlementGR: function(gr, subEntitlementObj, isNew) {
        for (var key in subEntitlementObj)
            gr.setValue(key, subEntitlementObj[key]);

        var sysId = '';
        if (isNew) {
            sysId = gr.insert();
            if (LicensingEngineDBConstants.SUBSCRIPTION_TYPE_VALUE.PER_USER.equals(gr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_TYPE))) {
                const entName = gr.getValue(LicensingEngineDBConstants.NAME);
                const entId = gr.getValue(LicensingEngineDBConstants.ENTITLEMENT_ID);
                const licensingEngineGlobalHelper = new global.LicensingEngineGlobalHelper();
                licensingEngineGlobalHelper.createEntitlementUsageReport(entName, entId, true);
                licensingEngineGlobalHelper.createEntitlementUsageReport(entName, entId, false);
            }
        } else
            sysId = gr.update();

        return sysId;
    },


    /**
     * Creates a new line item entitlement record
     *
     * @param {string} id - line item subscription entitlement id
     * @param {object} lineItemEntitlementObj - line item entitlement payload object
     */
    createLineItemEntitlementGR: function(id, lineItemEntitlementObj) {
        // Insert line items to subscription_entitlement_item table
        var GR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT_ITEM);
        GR.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, id);
        GR.query();

        if (GR.next()) {
            for (var key in lineItemEntitlementObj)
                GR.setValue(key, lineItemEntitlementObj[key]);
            GR.update();
        } else {
            var newGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT_ITEM);
            for (var key in lineItemEntitlementObj)
                newGR.setValue(key, lineItemEntitlementObj[key]);
            newGR.insert();
        }
    },

    /**
     * populate sku_metadata table
     */
    populateMetadataEntitlements: function() {
        this._cleanTable(LicensingEngineDBConstants.SKU_METADATA);

        if (global.LicensingScriptUtil.nil(this.subscriptionToMetadataObjList) || global.LicensingScriptUtil.isEmpty(this.subscriptionToMetadataObjList)) {
            return;
        }

        for (var entitlementID in this.subscriptionToMetadataObjList) {
            var metadataObjList = this.subscriptionToMetadataObjList[entitlementID];

            if (global.LicensingScriptUtil.notNil(this.metadataObjList) || !global.LicensingScriptUtil.isEmpty(this.metadataObjList)) {
                for (var i = 0; i < metadataObjList.length; i++) {
                    var metadataObj = metadataObjList[i];

                    var gr = new GlideRecord(LicensingEngineDBConstants.SKU_METADATA);
                    gr.setValue(LicensingEngineDBConstants.SUBSCRIPTION, entitlementID);
                    gr.setValue(LicensingEngineDBConstants.SCHEMA, metadataObj[LicensingEngineDBConstants.TYPE]);
                    gr.setValue(LicensingEngineDBConstants.COLUMN_VALUES, metadataObj[LicensingEngineDBConstants.COLUMN_VALUES]);
                    gr.setValue(LicensingEngineDBConstants.SUBSCRIPTION_ITEM, metadataObj[LicensingEngineDBConstants.SUBSCRIPTION_ITEM]);
                    gr.insert();
                }
            }
        }

    },

    processApplicationEntitlements: function(entitlementObj) {
        var appEntitlementObj = {};
        appEntitlementObj[LicensingEngineDBConstants.ENTITLEMENT_ID] = entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
        appEntitlementObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID] = entitlementObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID];
        appEntitlementObj[LicensingEngineDBConstants.FAMILY_ID] = entitlementObj[LicensingEngineDBConstants.FAMILY_ID];
        appEntitlementObj[LicensingEngineDBConstants.FAMILY_NAME] = entitlementObj[LicensingEngineConstants.OFFERING_NAME];
        appEntitlementObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL] = entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL];
        appEntitlementObj[this.PLUGIN_LIST] = global.LicensingScriptUtil.notNil(entitlementObj[this.PLUGIN_LIST]) ? entitlementObj[this.PLUGIN_LIST] : "";
        appEntitlementObj[LicensingEngineDBConstants.PRODUCTION_INSTANCE_NAMES] = entitlementObj[LicensingEngineConstants.INSTANCE_NAME];
        appEntitlementObj[LicensingEngineDBConstants.PRODUCT_CODE] = entitlementObj[LicensingEngineDBConstants.PRODUCT_CODE];
        appEntitlementObj[LicensingEngineDBConstants.UNIQUE_KEY] = entitlementObj[LicensingEngineDBConstants.UNIQUE_KEY];
        appEntitlementObj[LicensingEngineDBConstants.DISPLAY_TYPE] = this.getDisplayType(entitlementObj[LicensingEngineDBConstants.DISPLAY_TYPE]);

        this.applicationEntitlementMap[entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_ID]] = appEntitlementObj;
    },

    /**
     * Builds a list of apps for each subscription handling app -> app mapping
     */
    buildSubscriptionToAppMap: function() {
        if (global.LicensingScriptUtil.nil(this.applicationEntitlementMap) || global.LicensingScriptUtil.isEmpty(this.applicationEntitlementMap)) {
            this.logger.logInfo(this.type, "buildSubscriptionToAppMap", "There are no application entitlements in the payload.");
            return;
        }

        for (var id in this.applicationEntitlementMap) {
            var appObj = this.applicationEntitlementMap[id];
            var parentID = appObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID];

            this.findAppSubscription(parentID, appObj);
        }
    },
    /**
     * add explicit entitlement details for apps for each subscription handling app -> app mapping
     */
    addExplicitEntitlement: function() {
        if (global.LicensingScriptUtil.nil(this.explicitEntitlementMap)) {
            this.logger.logInfo(this.type, "addExplicitEntitlement", "There are no application explicit entitlement in the payload.");
            return;
        }

        Object.entries(this.applicationEntitlementMap).forEach(([entitlementID, applicationObj]) => {
            if (applicationObj[LicensingEngineDBConstants.UNIQUE_KEY] in this.explicitEntitlementMap)
                Object.assign(applicationObj, this.explicitEntitlementMap[applicationObj[LicensingEngineDBConstants.UNIQUE_KEY]]);

        });
    },

    /**
     * 1. EMS spports Application to Application mapping
     *  recursively find the subscription for an application entitlement
     * 2. For secondary subscriptions recursively find the primary
     *  susbcription in its parents so that all the apps and family gets mapped to
     *  top level primary subscription
     */
    findAppSubscription: function(parentID, applicationObj) {
        if (parentID in this.subscriptionEntitlementMap) {
            // we are checking for the map between secondary-level entitlement and application
            // families so that all such mappings will be merged to that of the top-level
            // entitlement.
            if (this.isSecondarySubscription(parentID)) {
                var newParentEntitlementID = this.subscriptionEntitlementMap[parentID][LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID];
                this.findAppSubscription(newParentEntitlementID, applicationObj);
            } else {
                var subscriptionStatus = this.subscriptionEntitlementMap[parentID][LicensingEngineDBConstants.STATUS];
                applicationObj[LicensingEngineDBConstants.SUBSCRIPTION_STATUS_FIELD] = subscriptionStatus;
                var appList = [];
                if (parentID in this.subscriptionToAppList)
                    appList = this.subscriptionToAppList[parentID];

                appList.push(applicationObj);
                this.subscriptionToAppList[parentID] = appList;
                return;
            }
        } else if (parentID in this.applicationEntitlementMap) {
            var newParentID = this.applicationEntitlementMap[parentID][LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID];
            this.findAppSubscription(newParentID, applicationObj);
        }
    },

    /**
     * triggers subscription consolidationa and get the final list of consolidated entitlements - subscriptions, app-families and metadata
     */
    consolidateEntitlements: function() {
        var consolidator = new EntitlementConsolidator(this.subscriptionEntitlementMap, this.subscriptionToAppList, this.subscriptionToMetadataObjList, this.dynamicPackageEntitlementArray, this.entitlementIdToCustAllotmentObj);
        var consolidatedEntitlements = consolidator.getConsolidatedEntitlements();
        this.subscriptionEntitlementMap = consolidatedEntitlements[LicensingEngineDBConstants.SUBSCRIPTION];
        this.subscriptionToAppList = consolidatedEntitlements[LicensingEngineDBConstants.SUBSCRIPTION_FAMILY];
        this.subscriptionToMetadataObjList = consolidatedEntitlements[LicensingEngineDBConstants.SKU_METADATA];
        this.entitlementIdToCustAllotmentObj = consolidatedEntitlements[LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT];
        this.lineItemsEntitlementsObj = consolidatedEntitlements[LicensingEngineDBConstants.LINE_ITEMS_ENTITLEMENT_OBJECT];

        if (this.licDebugLog == 'true') {
            this.logger.logInfo(this.type, "consolidateEntitlements", "Subscription entitlements after consolidation  : " + JSON.stringify(this.subscriptionEntitlementMap));
            this.logger.logInfo(this.type, "consolidateEntitlements", "App Family entitlements after consolidation  : " + JSON.stringify(this.subscriptionToAppList));
            this.logger.logInfo(this.type, "consolidateEntitlements", "Metadata entitlements after consolidation  : " + JSON.stringify(this.subscriptionToMetadataObjList));
            this.logger.logInfo(this.type, "consolidateEntitlements", "Custom Table Allotments after consolidation  : " + JSON.stringify(this.entitlementIdToCustAllotmentObj));
            this.logger.logInfo(this.type, "consolidateEntitlements", "Line Items entitlements after consolidation  : " + JSON.stringify(this.lineItemsEntitlementsObj));
        }
    },

    isSecondarySubscription: function(entitlementID) {
        var entitlementObj = this.subscriptionEntitlementMap[entitlementID];
        return entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE] == LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.SECONDARY_SUBSCRIPTION;
    },

    isMandatoryAttrValueMissing: function(entitleObj) {
        var mandatoryAttrList;
        var entitlementModelName = entitleObj[LicensingEngineDBConstants.ENTITLEMENT_MODEL];
        if (global.LicensingScriptUtil.nil(entitlementModelName))
            return true;

        if (this.arrayUtil.contains(LicensingEngineConstants.SUBSCRIPTION_TYPE_MODEL_NAMES, entitlementModelName))
            mandatoryAttrList = [].concat(LicensingEngineConstants.MANDATORY_ATTRIBUTES.SUBSCRIPTION);
        else if (this.arrayUtil.contains(LicensingEngineConstants.APPLICATION_TYPE_MODEL_NAMES, entitlementModelName))
            mandatoryAttrList = [].concat(LicensingEngineConstants.MANDATORY_ATTRIBUTES.APPLICATION);
        else if (this.arrayUtil.contains(LicensingEngineConstants.CLOUD_STATUS_TO_PROCESS, this.licensingEngineCommonUtil.toLowerCase(entitleObj[LicensingEngineDBConstants.STATUS])) && this.arrayUtil.contains(LicensingEngineConstants.ACCOUNT_LEVEL_CLOUD_ENTITLEMENT_MODEL_NAMES, entitlementModelName))
            mandatoryAttrList = [].concat(LicensingEngineConstants.MANDATORY_ATTRIBUTES.CLOUD);
        else
            return false;

        for (var i = 0; i < mandatoryAttrList.length; i++) {
            var key = mandatoryAttrList[i];
            if (!entitleObj.hasOwnProperty(key) || global.LicensingScriptUtil.nil(entitleObj[key])) {
                this.missingMandatoryAttr = key;
                return true;
            }
        }

        return false;
    },

    getEntitlementModel: function(entitlementModel) {
        if (this.arrayUtil.contains(LicensingEngineConstants.EMS_ENTITLEMENT_MODELS.SUBSCRIPTION, entitlementModel))
            return '0';
        else if (this.arrayUtil.contains(LicensingEngineConstants.EMS_ENTITLEMENT_MODELS.TRANSACTION, entitlementModel))
            return '1';

        return '0';
    },

    getProductAttributes: function(productAttrList) {
        var prodAttrObj = {};

        if (global.LicensingScriptUtil.nil(productAttrList))
            return prodAttrObj;

        for (var i = 0; i < productAttrList.length; i++) {
            var key = productAttrList[i]['attr_key'];
            var value = productAttrList[i]['attr_value'];
            prodAttrObj[key] = (global.LicensingScriptUtil.notNil(value)) ? value : "";
        }
        return prodAttrObj;
    },

    getDisplayType: function(displayType) {
        var activeDisplayType = this._extractBOMExclusionType(displayType);

        if (global.LicensingScriptUtil.nil(activeDisplayType))
            return "0";

        switch (activeDisplayType) {
            case LicensingEngineConstants.EMS_DISPLAY_TYPES.UE:
                return "1";
            case LicensingEngineConstants.EMS_DISPLAY_TYPES.CE:
                return "2";
            default:
                return "2";
        }
    },


    /**
     * This function retrieves the string value of exclusion code for an enetilement
     */
    _extractBOMExclusionType: function(displayType) {
        let displayTypeValue = "";

        if (global.LicensingScriptUtil.nil(displayType))
            return displayTypeValue;

        try {
            //we are expecting this in json.stringify format from transformer
            displayTypeValue = JSON.parse(displayType);
        } catch (e) {
            this.logger.logWarn(this.type, "_extractBOMExclusionType", e + " \n " + e.stack);
        }

        return displayTypeValue;
    },

    getDate: function(date) {
        if (date.length == 8)
            return date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6);

        return date;
    },

    getFeatures: function(featuresList) {
        var featuresObj = {};
        var fge = "";
        var dashboard = "";

        if (global.LicensingScriptUtil.nil(featuresList) || global.LicensingScriptUtil.isEmpty(featuresList)) {
            featuresObj[LicensingEngineDBConstants.FGE_IDS] = fge;
            featuresObj[LicensingEngineDBConstants.DASHBOARD_ID] = dashboard;
            return featuresObj;
        }


        for (var i = 0; i < featuresList.length; i++) {
            var obj = featuresList[i];
            if (obj[LicensingEngineDBConstants.TYPE] == 'Dashboard') {
                if (global.LicensingScriptUtil.nil(dashboard))
                    dashboard = obj[LicensingEngineDBConstants.ID];
                else
                    dashboard = dashboard + ',' + obj[LicensingEngineDBConstants.ID];
            } else if (obj[LicensingEngineDBConstants.TYPE] == 'Fine Grain Entitlements') {
                if (global.LicensingScriptUtil.nil(fge))
                    fge = obj[LicensingEngineDBConstants.ID];
                else
                    fge = fge + ',' + obj[LicensingEngineDBConstants.ID];
            }
        }

        featuresObj[LicensingEngineDBConstants.FGE_IDS] = fge;
        featuresObj[LicensingEngineDBConstants.DASHBOARD_ID] = dashboard;
        return featuresObj;
    },

    /**
     * By default all ServiceNow line items are paid (supported app field will always be empty).
     * Application Store line items are paid only if supportApp = 'True' else free.
     */
    getForFee: function(supportApp) {
        if (global.LicensingScriptUtil.notNil(supportApp) && supportApp != 'True')
            return false;

        return true;
    },

    getCategory: function(productAttrObj) {
        var prodFamily = productAttrObj[LicensingEngineConstants.PRODUCT_FAMILY];
        if (global.LicensingScriptUtil.notNil(prodFamily) && prodFamily == 'App Store') {
            return '1';
        }

        return '0';
    },

    getStatus: function(statusCode) {
        switch (statusCode) {
            case LicensingEngineConstants.EMS_STATUS_CODES.ACTIVE:
                return LicensingEngineConstants.EMS_STATUS_NUMBERS.ACTIVE;
            case LicensingEngineConstants.EMS_STATUS_CODES.EXPIRED:
                return LicensingEngineConstants.EMS_STATUS_NUMBERS.EXPIRED;
            default:
                return LicensingEngineConstants.EMS_STATUS_NUMBERS.INACTIVE;
        }
    },

    /**
     * The subscription_identifier will be 'IntegrationHubPool' for IHPool subscription (defn id = LICMCUIntegrationHubPool) which is the same as license_id value used in SMv1
     * Otherwise, subscription_identifier = entitlement_id, which will be unique for the same subscription product across different customer instances
     */
    getSubscriptionIdentifier: function(entitlementID, defnID) {
        if (global.LicensingScriptUtil.notNil(defnID) && defnID == LicensingEngineConstants.INTEGRATION_HUB_POOL_DEFN_ID)
            return LicensingEngineConstants.INTEGRATIONHUBPOOL;

        return entitlementID;
    },

    getSubscriptionType: function(productAttrObj, displayType) {
        if (global.LicensingScriptUtil.notNil(displayType) && displayType == LicensingEngineConstants.EMS_DISPLAY_TYPES.UE) {
            return '5';
        }

        var productFamily = global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.PRODUCT_FAMILY]) ? productAttrObj[LicensingEngineConstants.PRODUCT_FAMILY] : "";
        var prodAttr1 = global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.ATTRIBUTE_1]) ? productAttrObj[LicensingEngineConstants.ATTRIBUTE_1] : "";
        var prodAttr2 = global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.ATTRIBUTE_2]) ? productAttrObj[LicensingEngineConstants.ATTRIBUTE_2] : "";
        var licProdType = global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.LICENSE_PRODUCT_TYPE]) ? productAttrObj[LicensingEngineConstants.LICENSE_PRODUCT_TYPE] : "";


        if (licProdType == 'User') {
            if (prodAttr1 == 'Unrestricted User')
                return '2';
            else if (productFamily == 'App Store' && prodAttr1 == 'Application')
                return '3';
            else if (prodAttr1 == 'Application' && prodAttr2 == 'pa_indicator')
                return '4';
            else
                return '0';
        }

        if (licProdType == 'Quota')
            return '1';


        return '99';
    },
    getSubscriptionTypeForDynamicPackage: function(meterType) {
        switch (meterType) {
            case LicensingEngineConstants.EMS_METER_TYPES.UNRESTRICTED_USER:
                return LicensingEngineDBConstants.SUBSCRIPTION_TYPE_VALUE.UNRESTRICTED_USER;
            default:
                return LicensingEngineDBConstants.SUBSCRIPTION_TYPE_VALUE.OTHER;
        }
    },
    /**
     * Process measured role types for User products
     *
     * @param {json} productAttrObj
     *
     * @param {json} subscriptionType
     *
     * @returns {string} measured roles
     */
    getMeasuredRoleType: function(productAttrObj, subscriptionType) {

        var prodAttr1 = global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.ATTRIBUTE_1]) ? productAttrObj[LicensingEngineConstants.ATTRIBUTE_1] : "";
        var prodAttr2 = global.LicensingScriptUtil.notNil(productAttrObj[LicensingEngineConstants.ATTRIBUTE_2]) ? productAttrObj[LicensingEngineConstants.ATTRIBUTE_2] : "";

        //Measured roles applicable for Per-User and Unrestricted User
        if (subscriptionType == '0' || subscriptionType == '2')
            return this.getMeasuredRoles(prodAttr1, prodAttr2);

        return '';
    },

    /**
     * Function to process measured role types for User products. Since the logic is applicable only for user products
     * we only need to query with attribute_1 and attribute_2.
     * We don't have to check for license_product_type.
     *
     * The function will be called only for Per-User and Unrestricted User
     *
     * @param {string} prodAttr1
     *
     * @param {string} prodAttr2
     *
     * @returns {string} measured roles
     */
    getMeasuredRoles: function(prodAttr1, prodAttr2) {
        var gr = new GlideRecord(LicensingEngineDBConstants.LICENSE_MEASURED_ROLE_MAPPING);
        gr.addQuery(LicensingEngineDBConstants.ATTRIBUTE_1, prodAttr1);
        gr.addQuery(LicensingEngineDBConstants.ATTRIBUTE_2, prodAttr2);
        gr.query();
        if (gr.next())
            return gr.getValue(LicensingEngineDBConstants.LICENSE_MEASUREMENT);

        return '';
    },

    getSchema: function() {
        var entitlementMetadataConfig = gs.getProperty(LicensingEngineConstants.PROP_PRODUCT_METADATA_SUPPORTED_TYPES, LicensingEngineConstants.PRODUCT_METADATA_SUPPORTED_TYPES_PROP_DEFAULT_VALUE);
        var productMetadataRecordPath = JSON.parse(entitlementMetadataConfig).product_metadata_record_path;
        var explicit_entitlment = String(
            `"unique_key": "$.KEY",
			"product_code": "$.PRODUCTNUMBER",
            "role_types": {
                "RECORD_PATH": "$.USERTYPE[?(@.ACTIVE=='1')]",
                "RECORD_TYPE": "Array",
                "RECORD_ATTRIBUTES": {
                    "fulfiller": "$.FULFILLER",
                    "admin": "$.ADMIN",
                    "business_stakeholder": "$.BUSINESS_STAKEHOLDER",
                    "approver": "$.APPROVER",
                    "time_card_user": "$.TIME_CARD_USER",
                    "requester": "$.REQUESTER"
                }
            },
            "installable": "$.INSTALLATION[?(@.ACTIVE=='1')].INSTALLABLE"`
        );
        var entitlementExtractionSchema = String(`{
            "RECORD_PATH": "$.result",
            "RECORD_TYPE": "Root",
            "RECORD_ATTRIBUTES": {
                "entitlement_type": "$.EntitlementType",
                "storage_capacity": "$.ZEMS_StorageCapacity",
                "customer_name": "$.CustomerName",
                "entitlement_id": "$.EntitlementNo",
                "family_id": "$.ZEMS_ID_v1",
                "offering_name": "$.OfferingName",
                "end_date": "$.ValidTo",
                "start_date": "$.ValidFrom",
                "name": "$.ZEMS_Package_Name",
                "parent_entitlement_id": "$.ParentEntitlementNo",
                "purchased_count": "$.Quantity",
                "product_code": "$.OfferingID",
                "entitlement_model": "$.EntitlementModelName",
                "proposed_fix": "$.ZEMS_Proposed_Fix_v1",				
                "status": "$.StatusCode",
                "definition_id": "$.ZEMS_DefinitionID_v1",
                "unit_of_meter": "$.Uom",
                "meter_type": "$.ZEMS_MeterType_v1",
                "support_app": "$.ZEMS_SupApp_v1",
                "subclass_type": "$.ZEMS_SubClassType_v1",
                "instance_name": "$.InstanceName",
                "unique_key": "$.ZEMS_EEBOMId",
				"hosting_type": "$.HostingType",
				"display_type": "$.ZEMS_BOMExcl_v1[?(@.Active=='1')].Type",
				"package": "$.Package",
				"product_access_level": "$.ZEMS_Product_Access_Level_v2",
				"accelerator_sub_catalogs": {
					"RECORD_PATH": "$.ZEMS_Accelerator_SubCatalogs_v1",
                    "RECORD_TYPE": "Array",
                    "RECORD_ATTRIBUTES": {
                        "Accelerator": "$.Accelerator",
                        "Concurrency": "$.Concurrency"
                    }
				},
                "mdm_product_details": {
                    "RECORD_PATH": "$.MDM_PRODUCT_DATA",
                    "RECORD_TYPE": "Object",
                    "RECORD_ATTRIBUTES": {
                        "product_attribute": {
                            "RECORD_PATH": "$.PRODUCT[0].PRODUCT_ATTRIBUTES[?(@.ATTR_KEY=='ATTRIBUTE_1' || @.ATTR_KEY == 'ATTRIBUTE_2' || @.ATTR_KEY == 'LICENSE_PRODUCT_TYPE' || @.ATTR_KEY == 'PRODUCT_FAMILY' || @.ATTR_KEY == 'PACKAGE_TYPE' || @.ATTR_KEY == 'PROGRAM_TYPE' || @.ATTR_KEY == 'PRODUCT_FAMILY_3')]",
                            "RECORD_TYPE": "Array",
                            "RECORD_ATTRIBUTES": {
                                "attr_key": "$.ATTR_KEY",
                                "attr_value": "$.ATTR_VAL[0].VALUE"
                            }
                        },
                        "product_metadata": {
                            "RECORD_PATH": ${productMetadataRecordPath},
                            "RECORD_TYPE": "Array",
                            "RECORD_ATTRIBUTES": {
                                "attr_key": "$.ATTR_KEY",
                                "attr_details": {
                                    "RECORD_PATH": "$.ATTR_VAL",
                                    "RECORD_TYPE": "Array",
                                    "RECORD_ATTRIBUTES": {
                                        "attr_value_key": "$.ATTR_VAL_KEY",
                                        "attr_value": "$.VALUE",
                                        "active": "$.ACTIVE"
                                    }
                                }
                            }
                        },
                        "explicit_entitlements": {
                            "RECORD_PATH": "$.EXPLICIT_ENTITLEMENTS",
                            "RECORD_TYPE": "Array",
                            "RECORD_ATTRIBUTES": {
                                ${explicit_entitlment}
                            }
                        }
                    }
                },
                "features": {
                    "RECORD_PATH": "$.ZCI_Features_v1[?(@.Type == 'Fine Grain Entitlements' || @.Type == 'Dashboard')]",
                    "RECORD_TYPE": "Array",
                    "RECORD_ATTRIBUTES": {
                        "type": "$.Type",
                        "id": "$.ID"
                    }
                }
            }
        }`);
        return entitlementExtractionSchema;
    },

    getPayloadToTransformedEntitlementList: function(recordSysId, attachmentSysID) {
        var util = new sn_lef.EntitlementEngineUtils();
        var result = null;
        if (typeof util.saveAttachmentFromString == 'function') {
            var attachment = new GlideSysAttachment();
            attachmentContentStream = attachment.getContentStream(attachmentSysID);
            result = this.getTransformedEntitlementList(attachmentContentStream);
        } else {
            var gr = new GlideRecord(LicensingEngineDBConstants.ENTITLEMENT_DATA);
            if (gr.get(recordSysId)) {
                var payload = gr.getValue("payload");
                var licensingEngineGlobalHelper = new global.LicensingEngineGlobalHelper();
                var expandedPayload = licensingEngineGlobalHelper.expandToString(payload);
                var entitlementExtractionSchema = this.getSchema();
                result = licensingEngineGlobalHelper.getTransformedEntitlementList(entitlementExtractionSchema, expandedPayload);
            }
        }
        return result;
    },

    getTransformedEntitlementList: function(attachmentContentStream) {
        var entitlementExtractionSchema = this.getSchema();
        var extractor = new sn_lef.JsonRecordExtractor(entitlementExtractionSchema, attachmentContentStream);
        var result = [];
        while (extractor.hasNext()) {
            result.push(extractor.next());
        }

        return result;
    },

    getPayloadSysId: function(type) {
        var gr = new GlideRecord(LicensingEngineDBConstants.ENTITLEMENT_DATA);
        gr.addQuery(LicensingEngineDBConstants.TYPE, type);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.STATUS_VALUE.READY);
        gr.orderByDesc('sys_created_on');
        gr.query();
        if (gr.next())
            return gr.getUniqueValue();

        return '';
    },

    getAttachmentSysId: function(type) {
        this.recordSysId = this.getPayloadSysId(type);

        this.setEntitlementDataState();

        var gr = new GlideRecord('sys_attachment');
        gr.addQuery('table_sys_id', this.recordSysId);
        gr.addQuery('table_name', LicensingEngineDBConstants.ENTITLEMENT_DATA);
        gr.orderByDesc('sys_created_on');
        gr.query();
        if (gr.next())
            return gr.getUniqueValue();

        return '';
    },

    setEntitlementDataState: function() {
        var gr = new GlideRecord(LicensingEngineDBConstants.ENTITLEMENT_DATA);
        if (gr.get(this.recordSysId)) {
            gr.setValue(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.STATUS_VALUE.PROCESSING);
            gr.update();
        }
    },

    _setResult: function(status, error, errorCode, errorType, methodName, className) {
        this.result[LicensingEngineDBConstants.STATUS] = status;
        this.result[LicensingEngineDBConstants.ERROR] = error;
        this.result[LicensingEngineDBConstants.SYS_ID] = this.recordSysId;
        this.result[LicensingEngineDBConstants.ERROR_TYPE] = errorType;
        this.result[LicensingEngineDBConstants.ERROR_CODE] = errorCode;
        this.result[LicensingEngineConstants.METHOD_NAME] = methodName;
        this.result[LicensingEngineConstants.CLASS_NAME] = className;
    },

    _cleanTable: function(tableName) {
        var gr = new GlideRecord(tableName);
        gr.deleteMultiple();
    },
    /**
     * Function to recalculate end date for grandfather type secondary meter and primary subscription
     */
    recalculateEndDateGrandfatherSubscription: function() {

        if (global.LicensingScriptUtil.notNil(this.custTblAllotGrandfatherTypeEntID)) {
            const modifiedEndDate = gs.daysAgo(-1 * 100 * 365).substring(0, 10);
            this.subscriptionEntitlementMap[this.custTblAllotGrandfatherTypeEntID][LicensingEngineDBConstants.END_DATE] = modifiedEndDate;
            const primarySubEntID = this.subscriptionEntitlementMap[this.custTblAllotGrandfatherTypeEntID][LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID];
            this.subscriptionEntitlementMap[primarySubEntID][LicensingEngineDBConstants.END_DATE] = modifiedEndDate;
        }
    },

    type: 'EntitlementProcessor'
};
