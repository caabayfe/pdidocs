var EntitlementMetaDataBuilder = Class.create();
EntitlementMetaDataBuilder.prototype = {
    initialize: function() {
        this.arrayUtil = new global.LicensingScriptUtil();

        this.MDM_ATTR_KEY_TO_METADATA_TYPE = {
            SPOKE_TO_CALLER_SCOPE: 'ih_spoke_caller_scope',
            PROTOCOL: 'ih_protocol',
            SPOKE: 'ih_spoke'
        };

        this.MAPPING = 'MAPPING';
        this.ITOM_METER_RATIO = 'ITOM_METER_RATIO';
        this.SPOKE_TO_CALLER_SCOPE = 'SPOKE_TO_CALLER_SCOPE';
        this.ITOM_METER_BUNDLE = 'ITOM_METER_BUNDLE';
        this.APP_BUNDLE = 'APP_BUNDLE';
        this.INTEGRATIONHUB = 'INTEGRATIONHUB';
        this.PROTOCOL = 'PROTOCOL';
        this.GENAI_NOW_ASSIST = 'GENAI_NOW_ASSIST';

        this.ATTR_DETAILS = 'attr_details';
        this.ATTR_VALUE_KEY = 'attr_value_key';
        this.ATTR_KEY = 'attr_key';
        this.ATTR_VALUE = 'attr_value';
        this.METADATA_ID = 'metadata_id';
        this.DESCRIPTION = 'description';
        this.ACTIVE = 'active';
    },

    getMetadataObjList: function(metadataList, entitlementModelName) {
        var metadataObjList = [];
        if (global.LicensingScriptUtil.nil(metadataList) || global.LicensingScriptUtil.isEmpty(metadataList) || global.LicensingScriptUtil.nil(entitlementModelName))
            return metadataObjList;

        if (this.arrayUtil.contains(LicensingEngineConstants.SUBSCRIPTION_TYPE_MODEL_NAMES, entitlementModelName))
            metadataObjList = this.getMetadataObjListFromSubscription(metadataList);

        return metadataObjList;
    },

    /**
     * retrieves metadata details from product data of the subscription entitlement
     */
    getMetadataObjListFromSubscription: function(metadataList) {
        var entitlementMetadataConfig = gs.getProperty(LicensingEngineConstants.PROP_PRODUCT_METADATA_SUPPORTED_TYPES, LicensingEngineConstants.PRODUCT_METADATA_SUPPORTED_TYPES_PROP_DEFAULT_VALUE);
        var supportedTypes = JSON.parse(entitlementMetadataConfig).sku_metadata_supported_types.split(",");

        var metadataObjList = [];
        if (global.LicensingScriptUtil.nil(metadataList) || global.LicensingScriptUtil.isEmpty(metadataList))
            return metadataObjList;

        var appBundle = this.getITOMMeterBundle(metadataList);

        for (var i = 0; i < metadataList.length; i++) {
            var metadataObj = metadataList[i];
            var metadataType = metadataObj[this.ATTR_KEY];

            if (global.LicensingScriptUtil.nil(metadataType) || !supportedTypes.includes(metadataType))
                continue;

            var metadataDetails = metadataObj[this.ATTR_DETAILS];

            if (metadataType == this.MAPPING || metadataType == this.INTEGRATIONHUB) {
                var metadataDetailsList = this.getMetadataBasedOnAttrKey(metadataDetails);
                if (global.LicensingScriptUtil.notNil(metadataDetailsList) && !global.LicensingScriptUtil.isEmpty(metadataDetailsList))
                    metadataObjList = metadataObjList.concat(metadataDetailsList);
            } else if (metadataType == this.ITOM_METER_RATIO) {
                var itomMeterRatioObjList = this._getMetadataDetails(metadataDetails, LicensingEngineDBConstants.SU_RATIO, appBundle);
                if (global.LicensingScriptUtil.notNil(itomMeterRatioObjList) && !global.LicensingScriptUtil.isEmpty(itomMeterRatioObjList))
                    metadataObjList = metadataObjList.concat(itomMeterRatioObjList);
            } else if (metadataType == this.GENAI_NOW_ASSIST) {
                var genAiMetadataObjList = this._getMetadataDetails(metadataDetails, LicensingEngineDBConstants.GENAI_METADATA);
                if (global.LicensingScriptUtil.notNil(genAiMetadataObjList) && !global.LicensingScriptUtil.isEmpty(genAiMetadataObjList))
                    metadataObjList = metadataObjList.concat(genAiMetadataObjList);
            } else {
                var type = metadataType.toLowerCase();
                var metadataTypeList = this._getMetadataDetails(metadataDetails, type);
                if (global.LicensingScriptUtil.notNil(metadataTypeList) && !global.LicensingScriptUtil.isEmpty(metadataTypeList))
                    metadataObjList = metadataObjList.concat(metadataTypeList);
            }
        }

        return metadataObjList;
    },

    /**
     * iterates over all metadata objects to find ITOM_METER_BUNDLE and retrieve app bundle value
     */
    getITOMMeterBundle: function(metadataList) {
        var appBundle = '';

        if (global.LicensingScriptUtil.nil(metadataList) || global.LicensingScriptUtil.isEmpty(metadataList))
            return appBundle;

        for (var i = 0; i < metadataList.length; i++) {
            var metadataObj = metadataList[i];
            var metadataType = metadataObj[this.ATTR_KEY];

            if (global.LicensingScriptUtil.notNil(metadataType) && metadataType == this.ITOM_METER_BUNDLE) {
                var itomMeterBundle = metadataObj[this.ATTR_DETAILS];

                if (global.LicensingScriptUtil.nil(itomMeterBundle) || global.LicensingScriptUtil.isEmpty(itomMeterBundle))
                    return appBundle;

                for (var k = 0; k < itomMeterBundle.length; k++) {
                    var itomMeterBundleObj = itomMeterBundle[k];
                    var active = itomMeterBundleObj[this.ACTIVE];

                    if (global.LicensingScriptUtil.nil(active) || active != '1')
                        continue;

                    if (global.LicensingScriptUtil.notNil(itomMeterBundleObj[this.ATTR_VALUE_KEY]) && itomMeterBundleObj[this.ATTR_VALUE_KEY] == this.APP_BUNDLE) {
                        appBundle = itomMeterBundleObj[this.ATTR_VALUE];
                        return appBundle;
                    }
                }
            }
        }

        return appBundle;
    },

    /**
     * retrieves metadata details with following structure
     * [
     *  {
     *      "attr_value": "1",
     *      "attr_value_key": "featureId|featureName",
     *      "active": "1"
     *  },...
     *]
     */
    _getMetadataDetails: function(metadataList, metadataType, bundle) {
        var metadataObjList = [];

        if (global.LicensingScriptUtil.nil(metadataList) || global.LicensingScriptUtil.isEmpty(metadataList) || global.LicensingScriptUtil.nil(metadataType))
            return metadataObjList;

        metadataList.forEach(item => {
            if (item[this.ACTIVE] == "1" && this.ATTR_VALUE_KEY in item && this.ATTR_VALUE in item) {
                let metadataObject = {
                    [LicensingEngineDBConstants.TYPE]: metadataType,
                    [LicensingEngineDBConstants.COLUMN_VALUES]: `${item[this.ATTR_VALUE_KEY].replace("|", ",")},${item[this.ATTR_VALUE]}` + (global.LicensingScriptUtil.notNil(bundle) ? `,${bundle}` : '')
                };
                metadataObjList.push(metadataObject);
            }
        });

        return metadataObjList;
    },

    /**
     * retrieves IH spoke, IH protocol and IH spoke caller scope metadata details
     */
    getMetadataBasedOnAttrKey: function(metadataAttrList) {
        var metadataList = [];

        if (global.LicensingScriptUtil.nil(metadataAttrList) || global.LicensingScriptUtil.isEmpty(metadataAttrList))
            return metadataList;

        for (var i = 0; i < metadataAttrList.length; i++) {
            var metadataAttrObj = metadataAttrList[i];
            var attrValueKey = metadataAttrObj[this.ATTR_VALUE_KEY];
            var active = metadataAttrObj[this.ACTIVE];
            var attrValue = metadataAttrObj[this.ATTR_VALUE];

            if (global.LicensingScriptUtil.nil(active) || active != '1')
                continue;

            if (global.LicensingScriptUtil.notNil(attrValueKey) && attrValueKey in this.MDM_ATTR_KEY_TO_METADATA_TYPE) {
                var metadataObj = {};

                if (global.LicensingScriptUtil.notNil(attrValue)) {
                    metadataObj[LicensingEngineDBConstants.TYPE] = this.MDM_ATTR_KEY_TO_METADATA_TYPE[attrValueKey];

                    if (attrValueKey == this.PROTOCOL)
                        metadataObj[LicensingEngineDBConstants.COLUMN_VALUES] = attrValue.split("|")[0];
                    else
                        metadataObj[LicensingEngineDBConstants.COLUMN_VALUES] = attrValue.replace("|", ",");

                    metadataList.push(metadataObj);
                }

            }
        }

        return metadataList;
    },

    /**
     * retrieves value based on the keys passed
     * eg: attrKey: customtable_allotment
     *     attrValKey: allotment_type
     */
    getValueFromMetadataListByKey: function(metadataList, attrKey, attrValKey) {
        var value = '';

        if (global.LicensingScriptUtil.nil(metadataList))
            return value;

        for (var i = 0; i < metadataList.length; i++) {
            var metadataObj = metadataList[i];
            var metadataType = metadataObj[this.ATTR_KEY];

            if (global.LicensingScriptUtil.notNil(metadataType) && metadataType == attrKey) {
                var attributeDetails = metadataObj[this.ATTR_DETAILS];

                if (global.LicensingScriptUtil.nil(attributeDetails))
                    return value;

                for (var k = 0; k < attributeDetails.length; k++) {
                    var attributeDetailsObj = attributeDetails[k];

                    if (global.LicensingScriptUtil.nil(attributeDetailsObj[this.ACTIVE]) || attributeDetailsObj[this.ACTIVE] != '1')
                        continue;

                    if (global.LicensingScriptUtil.notNil(attributeDetailsObj[this.ATTR_VALUE_KEY]) && attributeDetailsObj[this.ATTR_VALUE_KEY] == attrValKey) {
                        value = attributeDetailsObj[this.ATTR_VALUE];
                        return value;
                    }
                }
            }
        }

        return value;
    },

    type: 'EntitlementMetaDataBuilder'
};
