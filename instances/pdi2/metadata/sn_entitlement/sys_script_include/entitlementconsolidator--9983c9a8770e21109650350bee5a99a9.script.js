var EntitlementConsolidator = Class.create();
EntitlementConsolidator.prototype = {
    initialize: function(subscriptionEntitlementMap, subscriptionToAppList, subscriptionToMetadataObjList, dynamicPackageEntitlementArray, entitlementIdToCustAllotmentObj) {
        this.subscriptionEntitleMap = subscriptionEntitlementMap;
        // deep copying an object
        this.duplicateSubscriptionEntitleMap = JSON.parse(JSON.stringify(subscriptionEntitlementMap));
        this.subscriptionToAppListMap = subscriptionToAppList;
        this.subscriptionToMetadataListMap = subscriptionToMetadataObjList;
        this.dynamicPackageEntitlementArray = dynamicPackageEntitlementArray;
        this.entitlementIdToCustAllotmentObj = entitlementIdToCustAllotmentObj;

        this.definitionIDToSubscriptionEID = {}; //track defn Ids of only eligible subscriptions for consolidation - key: defn ID, value: eligible subscription entitlement Id
        this.productCodeToSubscriptionEID = {};
        this.consolidatedSubscriptionEntitleMap = {};

        //it maintains the EID of the subcription to which the given subscription is getting consolidated into  - key: subscription entitlement id that is eligible for consolidation , value:  subscription entitlement id of the primary/consolidated subscription
        this.subEIDToConsolidatedSubEID = {}; // to handle the consolidation of secondary meters in Primary + Primary usecase

        this.arrayUtil = new global.LicensingScriptUtil();

        //priority order for entitlement types
        this.entitlementTypeOrder = {};
        this.entitlementTypeOrder[LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.PRIMARY_SUBSCRIPTION] = 1;
        this.entitlementTypeOrder[LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.SECONDARY_SUBSCRIPTION] = 2;
        this.entitlementTypeOrder[LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.SECONDARY_METER] = 3;

        this._explicitEntitlementsBuilder = new ExplicitEntitlementBuilder();

    },

    /**
     * iterates over all subscription entitlements and add each subscriptions to consolidatedSubscriptionEntitleMap
     *
     * while iterating over subscriptions and addding to consolidatedSubscriptionEntitleMap,
     * it checks if the current subscription is eligible for consolidation with the subscriptions in consolidatedSubscriptionEntitleMap
     * and consolidates subscriptions attributes, corresponding app families and  metadata
     *
     * @returns {consolidatedEntitlements} map with following keys
     * "subscription" - all subscriptions after consolidation (key: subscription entitlement ID , value: subscription object)
     * "subscription_family" - all app families for each subscription (key: subscription entitlement ID , value: [list of application family objects])
     * "sku_metadata" - all metadata for each subscription (key: subscription entitlement ID , value: [list of metadata objects])
     */
    getConsolidatedEntitlements: function() {
        var consolidatedEntitlements = {};

        for (var id in this.subscriptionEntitleMap) {
            var newSubscriptionObj = this.subscriptionEntitleMap[id];
            var newDefnID = newSubscriptionObj[LicensingEngineDBConstants.DEFINITION_ID];
            var productCode = newSubscriptionObj[LicensingEngineDBConstants.PRODUCT_CODE];
            var isUnrestrictedUserDefinition = newDefnID == LicensingEngineConstants.UNRESTRICTED_USER_DEFINITION_ID;
            // check eligibility for consolidation - subscription entitlements with same defn ID or unrestricted user entitlment and are in active status
            if (!this._shouldSkipConsolidation(newSubscriptionObj, newDefnID) && (newDefnID in this.definitionIDToSubscriptionEID || (isUnrestrictedUserDefinition && productCode in this.productCodeToSubscriptionEID))) {
                var existingConsolidatedSubObj = {};
                if(isUnrestrictedUserDefinition) {
                    existingConsolidatedSubObj = this.consolidatedSubscriptionEntitleMap[this.productCodeToSubscriptionEID[productCode]];
                } else {
                    existingConsolidatedSubObj = this.consolidatedSubscriptionEntitleMap[this.definitionIDToSubscriptionEID[newDefnID]];
                }                
                this._consolidateEntitlements(newSubscriptionObj, existingConsolidatedSubObj, newDefnID);
            } else {
                var newEntitlementID = newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
                this.consolidatedSubscriptionEntitleMap[newEntitlementID] = newSubscriptionObj;

                if (!this._shouldSkipConsolidation(newSubscriptionObj, newDefnID)) {
                    if(isUnrestrictedUserDefinition) {
                        this.productCodeToSubscriptionEID[productCode] = newEntitlementID;
                    } else {
                        this.definitionIDToSubscriptionEID[newDefnID] = newEntitlementID;
                    }
                }                
            }
        }

        this._updateCustomTableAllotments();

        this._postEntitlementConsolidation();

        var lineItemsEntitlementsObj = this._createNewLineItemsEntObjWhichAreRemovedAfterConsolidation();

        consolidatedEntitlements[LicensingEngineDBConstants.SUBSCRIPTION] = this.consolidatedSubscriptionEntitleMap;
        consolidatedEntitlements[LicensingEngineDBConstants.SUBSCRIPTION_FAMILY] = this.subscriptionToAppListMap;
        consolidatedEntitlements[LicensingEngineDBConstants.SKU_METADATA] = this.subscriptionToMetadataListMap;
        consolidatedEntitlements[LicensingEngineDBConstants.LICENSE_CUST_TABLE_ALLOTMENT] = this.entitlementIdToCustAllotmentObj;
        consolidatedEntitlements[LicensingEngineDBConstants.LINE_ITEMS_ENTITLEMENT_OBJECT] = lineItemsEntitlementsObj;

        return consolidatedEntitlements;
    },

    /**
     * Creates a new entitlement object for the subscriptions which are removed after consolidation
     */
    _createNewLineItemsEntObjWhichAreRemovedAfterConsolidation: function() {
        var newLineItemsEntObjPayload = {};
        var cleanedLineItems = this._getLineItemsFromSubEIDConsolidatedSubEID(this.subEIDToConsolidatedSubEID);
        // forming the new line items object
        for (let key in cleanedLineItems) {
            newLineItemsEntObjPayload[key] = this.duplicateSubscriptionEntitleMap[key];
            if (Array.isArray(cleanedLineItems[key])) {
                cleanedLineItems[key].forEach(id => {
                    newLineItemsEntObjPayload[id] = this.duplicateSubscriptionEntitleMap[id];
                    newLineItemsEntObjPayload[id][LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT] = key;
                });
            }
            newLineItemsEntObjPayload[key][LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT] = key;
        }
        return newLineItemsEntObjPayload;
    },

    /**
     * Get line items from subEIDToConsolidatedSubEID object
     */
    _getLineItemsFromSubEIDConsolidatedSubEID: function(subEIDToConsolidatedSubEID) {
        const lineItemsEntitlementIDs = {};
        for (const subEID in subEIDToConsolidatedSubEID) {
            const consolidatedSubEID = subEIDToConsolidatedSubEID[subEID];
            if (!(consolidatedSubEID in lineItemsEntitlementIDs)) {
                lineItemsEntitlementIDs[consolidatedSubEID] = [];
            }
            lineItemsEntitlementIDs[consolidatedSubEID].push(subEID);
        }
        return lineItemsEntitlementIDs;
    },

    /**
     * Checks whether an entitlement should be skipped for consolidation
     */
    _shouldSkipConsolidation: function(newSubscriptionObj, newDefnID) {
        //track defn Ids of only active subscriptions for consolidation
        if (global.LicensingScriptUtil.notNil(newDefnID) && (newSubscriptionObj[LicensingEngineDBConstants.STATUS] == '0' || newSubscriptionObj[LicensingEngineDBConstants.STATUS] == '2'))
            //DP Entitlements{Parent & Child} should not be considered for consolidation
            return this._isDPEntitlement(newSubscriptionObj);

        return true;
    },

    /**
     * Checks whether an entitlement is part of Dynamic Package(Parent or Child)
     */
    _isDPEntitlement(newSubscriptionObj) {
        return this.arrayUtil.contains(this.dynamicPackageEntitlementArray, newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID]) || newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE] == LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.SECONDARY_SUBSCRIPTION;
    },

    /**
     * Given 2 subscription entitlements, identifies which one would be the primary subscription
     * and then consolidates the other one into the primary subscription
     */
    _consolidateEntitlements: function(newSubscriptionObj, existingConsolidatedSubObj, defnID) {
        if (global.LicensingScriptUtil.nil(newSubscriptionObj) || global.LicensingScriptUtil.nil(existingConsolidatedSubObj) || global.LicensingScriptUtil.nil(defnID))
            return;

        if (this._isExistingSubscriptionObjPrimary(newSubscriptionObj, existingConsolidatedSubObj)) {
            //consolidate new subscription attributes to existing subscription
            this._consolidateEntitlementAttributes(existingConsolidatedSubObj, newSubscriptionObj);
        } else {
            //since new subscription is primary subscripiton, consolidate the existing subscription attributes to new subscription
            //then add it to consolidatedSubscriptionEntitleMap and remove the existing subscription from consolidatedSubscriptionEntitleMap

            this._consolidateEntitlementAttributes(newSubscriptionObj, existingConsolidatedSubObj);
            this.consolidatedSubscriptionEntitleMap[newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID]] = newSubscriptionObj;
            delete this.consolidatedSubscriptionEntitleMap[existingConsolidatedSubObj[LicensingEngineDBConstants.ENTITLEMENT_ID]];
            //track the new primary under the same key used for grouping: product code for Unrestricted User entitlements (all share definition DEF1000204), definition id otherwise.
            //writing UU primaries under definition id wrongly marks DEF1000204 as seen, mis-routing and dropping subsequent UU entitlements.
            if (defnID == LicensingEngineConstants.UNRESTRICTED_USER_DEFINITION_ID)
                this.productCodeToSubscriptionEID[newSubscriptionObj[LicensingEngineDBConstants.PRODUCT_CODE]] = newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
            else
                this.definitionIDToSubscriptionEID[defnID] = newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
        }
    },

    /**
     * Identifies the primary subscription among the 2 subscription based on the entitlement type of subscription
     * this.entitlementTypeOrder maintains the priority order of subscription to be a primary subscription (lowest number being highest priority) -  key: entitlement type , value: number
     *
     * if both subscriptions have same entitlement type or priority order then primary subscription is determined as
     * subscription with lowest 'Entitlement ID' if entitlement type is 'Primary Subscription'
     * or subscription with lowest 'Parent Entitlement ID' if entitlement type is 'Secondary Meter' or 'Secondary Subscription'
     */
    _isExistingSubscriptionObjPrimary: function(newSubscriptionObj, existingConsolidatedSubObj) {
        var newSubEID = newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
        var existingConsolidatedSubEID = existingConsolidatedSubObj[LicensingEngineDBConstants.ENTITLEMENT_ID];

        //if there is an active subscription with same definition (and product code for Unrestricted User) in subscription_entitlement then make sure to use that as primary subscription
        var subEntitleID = this.getSubscriptionEntitleIDForDefnOrProduct(existingConsolidatedSubObj[LicensingEngineDBConstants.DEFINITION_ID], existingConsolidatedSubObj[LicensingEngineDBConstants.PRODUCT_CODE]);
        if (global.LicensingScriptUtil.notNil(subEntitleID) && subEntitleID == existingConsolidatedSubEID)
            return true;
        else if (global.LicensingScriptUtil.notNil(subEntitleID) && subEntitleID == newSubEID)
            return false;

        var newSubTypeOrder = this.entitlementTypeOrder[newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE]];
        var consolidatedSubTypeOrder = this.entitlementTypeOrder[existingConsolidatedSubObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE]];

        if (newSubTypeOrder == consolidatedSubTypeOrder) {
            if (newSubTypeOrder == 1)
                return parseInt(existingConsolidatedSubEID) < parseInt(newSubEID);
            else
                return parseInt(existingConsolidatedSubObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID]) < parseInt(newSubscriptionObj[LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID]);
        }

        return consolidatedSubTypeOrder < newSubTypeOrder;
    },

    /**
     * consolidates the other subscription into the primary subscription
     * relavent subscription attriutes for consolidation are
     * start date, end date, purchase count, product code, FGE IDs, dashboard IDs, metadata, app-families, measured role type of subcription
     */
    _consolidateEntitlementAttributes: function(primarySubscriptionObj, newSubscriptionObj) {

        //this is hard coded for V, will have to be removed once EMS/MDM models consolidated name
        if (primarySubscriptionObj[LicensingEngineDBConstants.DEFINITION_ID] == 'LICMCUIntegrationHubPool')
            primarySubscriptionObj[LicensingEngineDBConstants.NAME] = "Integration Hub Pool";

        this.consolidateDates(primarySubscriptionObj, newSubscriptionObj);

        this.consolidatePurchaseCount(primarySubscriptionObj, newSubscriptionObj);

        this.consolidateProductCode(primarySubscriptionObj, newSubscriptionObj);

        this.consolidateByAppendingValues(primarySubscriptionObj, newSubscriptionObj, LicensingEngineDBConstants.FGE_IDS);

        this.consolidateByAppendingValues(primarySubscriptionObj, newSubscriptionObj, LicensingEngineDBConstants.DASHBOARD_ID);

        this.consolidateByAppendingValues(primarySubscriptionObj, newSubscriptionObj, LicensingEngineDBConstants.PRODUCTION_INSTANCE_NAMES);

        this.consolidateMetaData(primarySubscriptionObj, newSubscriptionObj);

        this.consolidateAppFamilyList(primarySubscriptionObj, newSubscriptionObj);

        this.consolidateLicMeasurements(primarySubscriptionObj, newSubscriptionObj);

        //set subscription is consolidated
        primarySubscriptionObj[LicensingEngineDBConstants.IS_CONSOLIDATED] = '1';

        //update this.subEIDToConsolidatedSubEID map accordingly to handle the consolidation of secondary meters in Primary + Primary usecases
        this._maintainConsolidatingSubEntitleIds(primarySubscriptionObj, newSubscriptionObj);
    },

    /**
     * consolidates subscription start and end dates
     * start date - It would be the oldest start date of subscriptions to be consolidated.
     * end date - It would be the latest end date of subscriptions to be consolidated.
     */
    consolidateDates: function(primarySubscriptionObj, newSubscriptionObj) {
        if (new GlideDateTime(newSubscriptionObj[LicensingEngineDBConstants.START_DATE]).compareTo(new GlideDateTime(primarySubscriptionObj[LicensingEngineDBConstants.START_DATE])) < 0)
            primarySubscriptionObj[LicensingEngineDBConstants.START_DATE] = newSubscriptionObj[LicensingEngineDBConstants.START_DATE];

        if (new GlideDateTime(newSubscriptionObj[LicensingEngineDBConstants.END_DATE]).compareTo(new GlideDateTime(primarySubscriptionObj[LicensingEngineDBConstants.END_DATE])) > 0)
            primarySubscriptionObj[LicensingEngineDBConstants.END_DATE] = newSubscriptionObj[LicensingEngineDBConstants.END_DATE];
    },

    /**
     * consolidates subscription purchase count by adding count of both subscriptions
     */
    consolidatePurchaseCount: function(primarySubscriptionObj, newSubscriptionObj) {
        const totalCount = parseFloat(primarySubscriptionObj[LicensingEngineDBConstants.PURCHASED_COUNT]) + parseFloat(newSubscriptionObj[LicensingEngineDBConstants.PURCHASED_COUNT])
        primarySubscriptionObj[LicensingEngineDBConstants.PURCHASED_COUNT] = String(totalCount > LicensingEngineConstants.UNLIMITED ? LicensingEngineConstants.UNLIMITED : totalCount);
    },

    /**
     * consolidates subscription product code as comma separate string of product codes of subscriptions to be consolidated
     */
    consolidateProductCode: function(primarySubscriptionObj, newSubscriptionObj) {
        var consolidatedProductCode = primarySubscriptionObj[LicensingEngineDBConstants.PRODUCT_CODE];
        var newProductCode = newSubscriptionObj[LicensingEngineDBConstants.PRODUCT_CODE];

        //to avoid duplicate product codes while consolidation
        if (global.LicensingScriptUtil.notNil(newProductCode) && consolidatedProductCode.indexOf(newProductCode) < 0)
            primarySubscriptionObj[LicensingEngineDBConstants.PRODUCT_CODE] = consolidatedProductCode + "," + newProductCode;
    },

    /**
     * consolidates value of given subscription attributeKey (FGE IDs/Dashboard IDs) as comma separate string of IDs
     */
    consolidateByAppendingValues: function(primarySubscriptionObj, newSubscriptionObj, attributeKey) {
        var consolidatedAttrValue = primarySubscriptionObj[attributeKey];
        var consolidatedAttrValueList = primarySubscriptionObj[attributeKey].split(',');

        if (global.LicensingScriptUtil.notNil(newSubscriptionObj[attributeKey])) {
            var newAttrValue = newSubscriptionObj[attributeKey].split(',');

            for (var i = 0; i < newAttrValue.length; i++) {
                var id = newAttrValue[i];

                if (global.LicensingScriptUtil.nil(consolidatedAttrValue)) {
                    consolidatedAttrValue = id;
                    consolidatedAttrValueList.push(id);
                } else if (!this.arrayUtil.contains(consolidatedAttrValueList, id)) { //to avoid duplicate IDs while consolidation
                    consolidatedAttrValue = consolidatedAttrValue + "," + id;
                    consolidatedAttrValueList.push(id);
                }
            }
        }

        primarySubscriptionObj[attributeKey] = consolidatedAttrValue;
    },

    /**
     * appends metadata objects of the other subscription to the primary subscription (can have duplicate metadata)
     */
    consolidateMetaData: function(primarySubscriptionObj, newSubscriptionObj) {
        var primarySubEntitlementID = primarySubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
        var newSubEntitlementID = newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];

        //add consolidated list of metadata objects to the primary subscripiton entitlement ID in metadata map
        if (newSubEntitlementID in this.subscriptionToMetadataListMap) {
            var newMetadataList = this.subscriptionToMetadataListMap[newSubEntitlementID];

            if (primarySubEntitlementID in this.subscriptionToMetadataListMap)
                this.subscriptionToMetadataListMap[primarySubEntitlementID] = this.subscriptionToMetadataListMap[primarySubEntitlementID].concat(newMetadataList);
            else
                this.subscriptionToMetadataListMap[primarySubEntitlementID] = newMetadataList;

            //remove entitlement ID to metadata mapping of new subscription from metadata map
            delete this.subscriptionToMetadataListMap[newSubEntitlementID];
        }
    },

    /**
     * appends app-family objects of the other subscription to the primary subscription (aviods duplicate families)
     */
    consolidateAppFamilyList: function(primarySubscriptionObj, newSubscriptionObj) {
        var primarySubEntitlementID = primarySubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
        var newSubEntitlementID = newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];

        var primarySubFamilyList = this.subscriptionToAppListMap[primarySubEntitlementID];
        var newSubFamilyList = this.subscriptionToAppListMap[newSubEntitlementID];

        if (global.LicensingScriptUtil.nil(newSubFamilyList) || global.LicensingScriptUtil.isEmpty(newSubFamilyList))
            return;

        if (global.LicensingScriptUtil.nil(primarySubFamilyList) || global.LicensingScriptUtil.isEmpty(primarySubFamilyList)) {
            this.subscriptionToAppListMap[primarySubEntitlementID] = newSubFamilyList;
            //remove entitlement ID to families mapping of new subscription from app-family map
            delete this.subscriptionToAppListMap[newSubEntitlementID];
            return;
        }

        //this maintains family ID as key and family object as value in order to avoid duplicate families while consolidation
        var uniqueObjMap = {};
        this._getUniqueFamilyObjMap(primarySubFamilyList, uniqueObjMap, LicensingEngineDBConstants.FAMILY_ID);
        this._getUniqueFamilyObjMap(newSubFamilyList, uniqueObjMap, LicensingEngineDBConstants.FAMILY_ID);

        //list of unique app family objects
        var consolidatedAppFamList = [];
        for (var famID in uniqueObjMap)
            consolidatedAppFamList.push(uniqueObjMap[famID]);

        this.subscriptionToAppListMap[primarySubEntitlementID] = consolidatedAppFamList;
        //remove entitlement ID to families mapping of new subscription from app-family map
        delete this.subscriptionToAppListMap[newSubEntitlementID];
    },

    _getUniqueFamilyObjMap: function(inputList, uniqueObjMap, uniqueKey) {
        if (global.LicensingScriptUtil.nil(inputList) || global.LicensingScriptUtil.nil(uniqueObjMap) || global.LicensingScriptUtil.nil(uniqueKey))
            return;

        for (var i = 0; i < inputList.length; i++) {
            var obj = inputList[i];
            var keyAttrValue = obj[uniqueKey];

            if (global.LicensingScriptUtil.notNil(keyAttrValue)) {
                obj = this._consolidateFamilyObj(uniqueObjMap[keyAttrValue], obj);
                uniqueObjMap[keyAttrValue] = obj;
            }
        }
    },

    _consolidateFamilyObj: function(family1, family2) {
        if (global.LicensingScriptUtil.nil(family1) && global.LicensingScriptUtil.nil(family2))
            return;

        if (global.LicensingScriptUtil.nil(family1))
            return family2;

        if (global.LicensingScriptUtil.nil(family2))
            return family1;

        let consolidatedFamily = {};
        Object.assign(consolidatedFamily, family1);

        //consolidation of explicit entitlement
        consolidatedFamily[LicensingEngineDBConstants.ENTITLED_ROLE_TYPES] = this._explicitEntitlementsBuilder.getUniqueRoleTypes(
            family1[LicensingEngineDBConstants.ENTITLED_ROLE_TYPES], family2[LicensingEngineDBConstants.ENTITLED_ROLE_TYPES]);
        consolidatedFamily[LicensingEngineDBConstants.UNRESTRICTED_ROLE_TYPES] = this._explicitEntitlementsBuilder.getUniqueRoleTypes(
            family1[LicensingEngineDBConstants.UNRESTRICTED_ROLE_TYPES], family2[LicensingEngineDBConstants.UNRESTRICTED_ROLE_TYPES]);
        consolidatedFamily[LicensingEngineDBConstants.INSTALLABLE] = this._explicitEntitlementsBuilder.getInstallableStatus(
            family1[LicensingEngineDBConstants.INSTALLABLE], family2[LicensingEngineDBConstants.INSTALLABLE]);

        return consolidatedFamily;
    },

    _addUniqueObjMap: function(inputList, uniqueObjMap, keyAttribute) {
        if (global.LicensingScriptUtil.nil(inputList) || global.LicensingScriptUtil.nil(uniqueObjMap) || global.LicensingScriptUtil.nil(keyAttribute))
            return;

        for (var i = 0; i < inputList.length; i++) {
            var obj = inputList[i];
            var keyAttrValue = obj[keyAttribute];

            //add to uniqueObjMap only if key value is not present
            if (global.LicensingScriptUtil.notNil(keyAttrValue) && !(keyAttrValue in uniqueObjMap))
                uniqueObjMap[keyAttrValue] = obj;
        }
    },

    /**
     * identifies the highest role type as measure role type for consolidating subscription
     * the order number specified for each role type in license_role_type indicates the priority - lowest order number being highest priority
     */
    consolidateLicMeasurements: function(primarySubscriptionObj, newSubscriptionObj) {
        var primarySubMeasuredRoleTypes = primarySubscriptionObj[LicensingEngineDBConstants.MEASURED_ROLE_TYPES];
        var newSubMeasuredRoleTypes = newSubscriptionObj[LicensingEngineDBConstants.MEASURED_ROLE_TYPES];


        if (global.LicensingScriptUtil.nil(newSubMeasuredRoleTypes))
            return;

        if (global.LicensingScriptUtil.nil(primarySubMeasuredRoleTypes)) {
            primarySubscriptionObj[LicensingEngineDBConstants.MEASURED_ROLE_TYPES] = newSubMeasuredRoleTypes;
            return;
        }

        primarySubMeasuredRoleTypes = primarySubMeasuredRoleTypes.split(",");
        newSubMeasuredRoleTypes = newSubMeasuredRoleTypes.split(",");

        //if both subscriptions have same measured role types then return, consolidation is not required
        if (global.LicensingScriptUtil.nil(this.arrayUtil.diff(primarySubMeasuredRoleTypes, newSubMeasuredRoleTypes)))
            return;

        //if both subscriptions have different measured role types, get higest role type
        var consolidatedMeasuredRoleType = this.getHighestMeasuredRoleType(this.arrayUtil.union(primarySubMeasuredRoleTypes, newSubMeasuredRoleTypes));

        if (global.LicensingScriptUtil.nil(consolidatedMeasuredRoleType))
            return;

        primarySubscriptionObj[LicensingEngineDBConstants.MEASURED_ROLE_TYPES] = consolidatedMeasuredRoleType;
    },

    getHighestMeasuredRoleType: function(measuredRoleTypeList) {
        var highestRoleType = '';

        if (gs.tableExists(LicensingEngineDBConstants.LICENSE_ROLE_TYPE)) {
            var roleTypeGR = new GlideRecord(LicensingEngineDBConstants.LICENSE_ROLE_TYPE);
            roleTypeGR.addQuery(LicensingEngineDBConstants.SYS_ID, measuredRoleTypeList);
            roleTypeGR.orderBy(LicensingEngineDBConstants.ORDER);
            roleTypeGR.query();

            if (roleTypeGR.next())
                highestRoleType = roleTypeGR.getValue(LicensingEngineDBConstants.SYS_ID);
        }

        return highestRoleType;
    },

    getSubscriptionEntitleIDForDefnOrProduct: function(defnID, productCode) {
        var subscriptionEntitleID = '';

        var subsentitleGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        subsentitleGR.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        subsentitleGR.addQuery(LicensingEngineDBConstants.ENTITLEMENT_TYPE, '!=', LicensingEngineDBConstants.ENTITLEMENT_TYPE_VALUE.SECONDARY_SUBSCRIPTION); //safety check to exclude secondary subscriptions as they should not be consolidated
        subsentitleGR.addQuery(LicensingEngineDBConstants.DEFINITION_ID, defnID);
        //Unrestricted User entitlements all share definition DEF1000204, so scope by product code to find this group's existing primary instead of an arbitrary UU record (DEF0855946)
        if (defnID == LicensingEngineConstants.UNRESTRICTED_USER_DEFINITION_ID && global.LicensingScriptUtil.notNil(productCode))
            subsentitleGR.addQuery(LicensingEngineDBConstants.PRODUCT_CODE, productCode);
        subsentitleGR.query();

        if (subsentitleGR.next()) {
            var entitleID = subsentitleGR.getValue(LicensingEngineDBConstants.ENTITLEMENT_ID);
            //safety check to exclude dynamic package subscriptions as they should not be consolidated
            if (!this.arrayUtil.contains(this.dynamicPackageEntitlementArray, entitleID))
                subscriptionEntitleID = entitleID;
        }

        return subscriptionEntitleID;
    },

    /**
     * This is to keep the mapping between entitlement id of subscription that is eligible for consolidation and entitlement id of the primary/consolidated subscription in cache
     * so that as part _postEntitlementConsolidation(), parent entitlement of each secondary meter would be updated with the latest consolidated entitlement ID
     */
    _maintainConsolidatingSubEntitleIds: function(primarySubscriptionObj, newSubscriptionObj) {
        var primarySubEntId = primarySubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];
        var otherSubEntId = newSubscriptionObj[LicensingEngineDBConstants.ENTITLEMENT_ID];

        this.subEIDToConsolidatedSubEID[otherSubEntId] = primarySubEntId;
        //if otherSubEntId was mapped as primary/consolidated subscription for any other subscriptions then update the value to the new primarySubEntId
        for (var id in this.subEIDToConsolidatedSubEID) {
            if (this.subscriptionEntitleMap[id] == otherSubEntId)
                this.subscriptionEntitleMap[id] = primarySubEntId;
        }
    },

    /**
     * 1. this.subEIDToConsolidatedSubEID variable holds what all entitlements got consolidated_from to consolidated_to
     * 2. Iterate this.entitlementIdToCustAllotmentObj and create 'custTableAllotmentMap'
     * 3. Iterate 'custTableAllotmentMap' and check if entitlementId is in consolidated_from (Step #1)
     *    - If yes, create a new Map (consolidatedEntIdToTotalMap) with the consolidated_to entitlement_id as key and numberOfTables as value, and remove the entry (consolidated_from) from 'custTableAllotmentMap' to avoid creating entries in license_cust_table_allotment table
     *    - If no, changes are not needed
     * 3. Update the count of consolidated_to entitlement_id in the result 'custTableAllotmentMap' Map
     * 4. From EMS if we receive quantity as 999999999 (9 9's) its 'Unlimited', for now we are setting it to 999999999 and not sum up with TableBundle quantity
     * 5. Convert 'custTableAllotmentMap' Map back to this.entitlementIdToCustAllotmentObj
     *
     * eg:
     *
     * 	this.subEIDToConsolidatedSubEID = {"3424881":"3424730","3424750":"3424730"};
     *
     *  this.entitlementIdToCustAllotmentObj = {
     *		"3424775": {
     *			"sysId": "-1",
     *			"entitlementId": "3424881",
     *			"numberOfTables": "50",
     *			"allotmentType": "TableBundle"
     *		},
     *		"3424724": {
     *			"sysId": "-1",
     *			"entitlementId": "3424730",
     *			"numberOfTables": "25",
     *			"allotmentType": "TableBundle"
     *		},
     *		"3424743": {
     *			"sysId": "-1",
     *			"entitlementId": "3424750",
     *			"numberOfTables": "25",
     *			"allotmentType": "TableBundle"
     *		}
     *	};
     *
     *	Result >>>
     *
     *	this.entitlementIdToCustAllotmentObj = {
     *		"3424724": {
     *			"sysId": "-1",
     *			"entitlementId": "3424730",
     *			"numberOfTables": "100",
     *			"allotmentType": "TableBundle"
     *		}
     *	}
     */
    _updateCustomTableAllotments: function() {
        const custTableAllotmentMap = new Map();
        for (const parentEntId in this.entitlementIdToCustAllotmentObj) {
            custTableAllotmentMap.set(parentEntId, this.entitlementIdToCustAllotmentObj[parentEntId]);
        }

        const consolidatedEntIdToTotalMap = new Map();
        for (const [key, value] of custTableAllotmentMap.entries()) {
            if (key in this.subEIDToConsolidatedSubEID) {
                // Primary -> Primary
                let tablesCount = parseInt(value.numberOfTables);
                if (consolidatedEntIdToTotalMap.get(this.subEIDToConsolidatedSubEID[key]) != null) {
                    tablesCount += consolidatedEntIdToTotalMap.get(this.subEIDToConsolidatedSubEID[key]);
                }
				/**
 				* DEF0594816 - Missing  record in Custom table allotment due to product consolidation

 				* Primary Subscription (P1) has no Secondary Meter (Custom Tables)  and later customer purchases another
 				* Primary Subscription (P2) which has Secondary Meter (Custom Tables) (S2)
 				* Actual (Table Entries):
 				*    subscription_entitlement
 				*         P1 (Includes P2 Purchased Count)
 				*         S2 (ParentEntitlementId is set to P1)
 				*    license_cust_table_allotment
 				*         No Record Created for P1

 				* Expected (Table Entries):
 				*   subscription_entitlement
 				*        P1 (Includes P2 Purchased Count)
 				*        S2 (ParentEntitlementId is set to P1)
 				*    license_cust_table_allotment
 				*         P1 (S2's Count)

 				* Example:
 				* OfferingID: PROD11367
 				* OfferingName: HR Enterprise Onboarding
 				* ZEMS_DefinitionID_v1: DEF1000205
 				* EntitlementNo: 3841517
 				* ParentEntitlementNo: 3841012
 				* Quantity: 4000

 				* OfferingID: PROD17237
 				* OfferingName: HR Service Delivery Professional
 				* ZEMS_DefinitionID_v1: DEF1000205
 				* EntitlementNo: 3841950
 				* ParentEntitlementNo: 3841012
 				* Quantity: 220645

 				* OfferingID: PROD20555
 				* OfferingName: Bundled Custom Tables for HR
 				* ZEMS_DefinitionID_v1: DEFCTEAHR
 				* EntitlementNo: 6093812
 				* ParentEntitlementNo: 3841950
 				* Quantity : 15

 				* Expected : There should be an entry in license_cust_table_allotment with
 				* Subscription : HR Enterprise Onboarding and Number of custom tables : 15
 				*/
				var consolidatedToEID = this.subEIDToConsolidatedSubEID[key];
				if(!custTableAllotmentMap.has(consolidatedToEID)){
					value['numberOfTables'] = tablesCount;
					custTableAllotmentMap.set(consolidatedToEID, value);
					tablesCount = 0;
				}
                consolidatedEntIdToTotalMap.set(this.subEIDToConsolidatedSubEID[key], tablesCount);
                custTableAllotmentMap.delete(key);
            } else if (value.entitlementId in this.subEIDToConsolidatedSubEID) {
                // Secondary -> Primary or Secondary -> Secondary
                let tablesCount = parseInt(value.numberOfTables);

                let consolidatedToEntId = this.subEIDToConsolidatedSubEID[value.entitlementId];

                // Primary_1 + Secondary_1 - we have to create entries in license_cust_table_allotment and ua_cust_tbl_entitlement, so don't have to remove from the map
                if (consolidatedToEntId == key)
                    continue;

                if (consolidatedEntIdToTotalMap.get(consolidatedToEntId) != null) {
                    tablesCount += consolidatedEntIdToTotalMap.get(consolidatedToEntId);
                }
                consolidatedEntIdToTotalMap.set(consolidatedToEntId, tablesCount);
                custTableAllotmentMap.delete(key);
            }
        }

        for (const [key, value] of custTableAllotmentMap.entries()) {
            if (consolidatedEntIdToTotalMap.get(key) != null) {
                const totalCount = parseInt(value.numberOfTables) + consolidatedEntIdToTotalMap.get(key);
                value.numberOfTables = '' + totalCount > LicensingEngineConstants.UNLIMITED ? LicensingEngineConstants.UNLIMITED : totalCount;
                consolidatedEntIdToTotalMap.delete(key); // Remove here so we dont add twice when we process this consolidatedEntIdToTotalMap map again
            } else if (consolidatedEntIdToTotalMap.get(value.entitlementId) != null) {
                const totalCount = parseInt(value.numberOfTables) + consolidatedEntIdToTotalMap.get(value.entitlementId);
                value.numberOfTables = '' + totalCount > LicensingEngineConstants.UNLIMITED ? LicensingEngineConstants.UNLIMITED : totalCount;
                consolidatedEntIdToTotalMap.delete(value.entitlementId); // Remove here so we dont add twice when we process this consolidatedEntIdToTotalMap map again
            }

            if (value.numberOfTables == LicensingEngineConstants.UNLIMITED)
                value.allotmentType = LicensingEngineConstants.ALLOTMENT_TYPES.APP_ENGINE;
        }

        /**
         * Consider the below case
         *
         * P1 (S1), P2 (S2), P3 (S3) and P4 (S4)
         *
         * P1 and P3 consolidated to P2 because of similar Def#1.
         * Also, S1 and S3 got consolidated into S2 because of similar Def#2.
         * P4 did not consolidate into anything.
         *
         * S4 has the same definition Def#2 like other Secondary Meters but it falls under a different Primary Subscription P4. So to consolidate that S4 into S2, lookup if there are any other entries in
         * consolidatedEntIdToTotalMap and check in custTableAllotmentMap if S2 has a key then add that count as well to S2.
         */
        for (var [entId, tableCount] of consolidatedEntIdToTotalMap.entries()) {
            for (var [parentEntId, custAllotmentObj] of custTableAllotmentMap.entries()) {
                if (parentEntId == entId || custAllotmentObj.entitlementId == entId) {
                    var totalCount = parseInt(custAllotmentObj.numberOfTables) + tableCount;

                    custAllotmentObj.numberOfTables = '' + totalCount > LicensingEngineConstants.UNLIMITED ? LicensingEngineConstants.UNLIMITED : totalCount;
                    if (custAllotmentObj.numberOfTables == LicensingEngineConstants.UNLIMITED)
                        custAllotmentObj.allotmentType = LicensingEngineConstants.ALLOTMENT_TYPES.APP_ENGINE;

                    consolidatedEntIdToTotalMap.delete(entId);
                }
            }
        }
        this.entitlementIdToCustAllotmentObj = Object.fromEntries(custTableAllotmentMap);
    },

    _postEntitlementConsolidation: function() {

        //update parent entitlement of each subscription with the latest consolidated entitlement ID
        for (var id in this.consolidatedSubscriptionEntitleMap) {
            var parentEntitleID = this.consolidatedSubscriptionEntitleMap[id][LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID];
            if (parentEntitleID in this.subEIDToConsolidatedSubEID)
                this.consolidatedSubscriptionEntitleMap[id][LicensingEngineDBConstants.PARENT_ENTITLEMENT_ID] = this.subEIDToConsolidatedSubEID[parentEntitleID];
        }
    },

    type: 'EntitlementConsolidator'
};
