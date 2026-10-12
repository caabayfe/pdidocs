var LicensingStore = Class.create();
LicensingStore.prototype = {
    initialize: function() {
		
        this.wdfDefinitionId = 'WDFTESTDEFID';
        this.wdfV2DefinitionId = "DEFN2014816";
        this.wdfTag = 'wdf_meter_ratio';
        this.logger = new WdfLogger();
        this.wdfUtil = new WdfUtil();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////

    getSkuMetadata: function() {

        try {
            var response = new sn_entitlement.SubscriptionEntitlementsService().getEntitledMetadataByType(this.wdfTag);
            return this.getSkuMetadataWithResponse(response);
        } catch (err) {
            this.logger.debug("Error fetching SKU metadata: " + err);
            throw err;
        }
    },

    getSkuMetadataWithResponse: function(response) {
        this.logger.debug("getSkuMetadataWithResponse with response: " + response);

        var skuMetadata = JSON.parse(response);

        if (skuMetadata == null) {
            throw "Unparseable sku metadata response: " + response;
        }

        return skuMetadata
            .filter(metadata => this.isWdfSkuMetadata(metadata))
            .map(metadata => this.appendColumnMapping(metadata));
    },

    isWdfSkuMetadata: function(metadata) {
        return this.wdfUtil.getJsonPathValue(metadata, "$['schema.type']") == this.wdfTag;
    },

    appendColumnMapping: function(metadata) {
        var columnNames = metadata["schema.column_names"];
        var columnValues = metadata["column_values"];

        if (columnNames == null || columnValues == null) {
            return metadata;
        }

        var columnMapping = this.wdfUtil.zipArraysToMap(columnNames.split(','), columnValues.split(','));

        var capabilityId = this.wdfUtil.getJsonPathValue(columnMapping, "$.capability_id");

        if (typeof capabilityId === "string" || capabilityId instanceof String) {
            columnMapping["capability_id"] = capabilityId.trim().toUpperCase();
        }

        metadata["column_mapping"] = columnMapping;
        this.logger.debug("Append column mapping to metadata: " + JSON.stringify(columnMapping));

        return metadata;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////

    getGlobalConfigs: function() {
        try {
            var response = new sn_entitlement.SubscriptionEntitlementsService().getAllMDMProducts();
            return this.getGlobalConfigsWithResponse(response);
        } catch (err) {
            this.logger.debug("Error fetching global configs: " + err);
            throw err;
        }
    },

    getGlobalConfigsWithResponse: function(response) {
        this.logger.debug("getGlobalConfigsWithResponse with response: " + response);

        var globalConfigs = JSON.parse(response);

        if (globalConfigs == null) {
            throw "Unparseable global config response: " + response;
        }

        var result = {};

        return globalConfigs
            .filter(globalConfig => this.isWdfGlobalConfig(globalConfig))
            .map(globalConfig => globalConfig.data)
            .filter(metadata => metadata != null)
            .reduce((result, metadata) => {
                var configMapping = this.createConfigMapping(metadata);
                var capabilityId = configMapping["capability_id"];

                if (capabilityId == null) {
                    this.logger.debug("Omitting metadata due to invalid capabilityId: " + capabilityId);
                    return result;
                }

                result[capabilityId] = configMapping;
                return result;
            }, {});
    },

    isWdfGlobalConfig: function(metadata) {
        return this.wdfUtil.getJsonPathValue(metadata, "$.config_type") == this.wdfTag;
    },

    createConfigMapping: function(metadata) {
        var capabilityId = this.wdfUtil.getJsonPathValue(metadata, "$.PRODUCT[0].PRODUCT_ATTRIBUTES[?(@.ATTR_KEY=='SKU')].ATTR_VAL[0].VALUE");

        if (typeof capabilityId === "string" || capabilityId instanceof String) {
            capabilityId = capabilityId.trim().toUpperCase();
        }

        var config = {
            "capability_id": capabilityId,
            "capability_label": this.wdfUtil.getJsonPathValue(metadata, "$.PRODUCT[0].PRODUCT_NAME.ATTR_VAL"),
            "type": this.wdfUtil.getJsonPathValue(metadata, "$.PRODUCT[0].PRODUCT_ATTRIBUTES[?(@.ATTR_KEY=='METER')].ATTR_VAL[0].VALUE"),
            "ua_definition_id": this.wdfUtil.getJsonPathValue(metadata, "$.PRODUCT[0].DEFINITION_ID"),
            "schedule": this.wdfUtil.getJsonPathValue(metadata, "$.PRODUCT[0].PRODUCT_ATTRIBUTES[?(@.ATTR_KEY=='LEGACY_UNIT')].ATTR_VAL[0].VALUE")
        };

        this.logger.debug("Constructed config for " + capabilityId + ": " + JSON.stringify(config));

        return config;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////

    getValidEntitlements: function() {
        try {
            var response = new sn_entitlement.SubscriptionEntitlementsService().getAllActiveEntitlements();
            return this.getValidEntitlementsWithResponse(response);
        } catch (err) {
            this.logger.debug("Error fetching valid entitlements: " + err);
            throw err;
        }
    },

    getValidEntitlementsWithResponse: function(response) {
        this.logger.debug("getValidEntitlementsWithResponse with response: " + response);

        var entitlements = JSON.parse(response);

        if (entitlements == null) {
            throw "Unparseable entitlement response: " + response;
        }

        var hasTestDef = entitlements.some(e => e.definition_id == this.wdfDefinitionId);
        var effectiveDefId = hasTestDef ? this.wdfDefinitionId : this.wdfV2DefinitionId;
        this.logger.debug("Filtering entitlements on definition_id: " + effectiveDefId);

        return entitlements
            .filter(entitlement => entitlement.definition_id == effectiveDefId)
            .reduce((result, entitlement) => {
                var productCode = entitlement.product_code;
                if (productCode == null) {
                    this.logger.debug("Omitting entitlement due to invalid product_code");
                    return result;
                }
                result[productCode] = entitlement;
                return result;
            }, {});
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////

    getAllEntitlements: function() {
        try {
            var response = new sn_entitlement.SubscriptionEntitlementsService().getAllActiveEntitlements();
            var entitlements = JSON.parse(response);
            if (entitlements == null) {
                throw "Unparseable entitlement response: " + response;
            }
            return entitlements.reduce((result, entitlement) => {
                var productCode = entitlement.product_code;
                if (productCode == null) {
                    return result;
                }
                result[productCode] = entitlement;
                return result;
            }, {});
        } catch (err) {
            this.logger.debug("Error fetching all entitlements: " + err);
            throw err;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////

    getConfigurations: function() {
        var resultMap = {};

        try {
            var entitlements = this.getValidEntitlements();
            var skuMetadata = this.getSkuMetadata();
            var globalConfigs = this.getGlobalConfigs();
            var allEntitlements = this.getAllEntitlements();
        } catch (err) {
            this.logger.debug("Error fetching WDF configurations: " + err);
            throw err;
        }

        var subscriptionNameToProductCode = {};
        for (var productCode in allEntitlements) {
            var entitlementName = allEntitlements[productCode].name;
            if (entitlementName != null) {
                subscriptionNameToProductCode[entitlementName] = allEntitlements[productCode].product_code;
            }
        }

        for (var i = 0; i < skuMetadata.length; i++) {
            try {
                var capabilityId = this.wdfUtil.getJsonPathValue(skuMetadata[i], "$.column_mapping.capability_id");
                var entitlementSysId = this.wdfUtil.getJsonPathValue(skuMetadata[i], "$['subscription_item.sys_id']");
                var exchangeValue = this.wdfUtil.getJsonPathValue(skuMetadata[i], "$.column_mapping.exchange_value");
                exchangeValue = parseFloat(exchangeValue);

                if (capabilityId == null) {
                    throw "Invalid capability id: " + capabilityId;
                }

                if (entitlementSysId == null) {
                    throw "Invalid entitlement sys_id: " + entitlementSysId;
                }

                var subscriptionItemName = this.wdfUtil.getJsonPathValue(skuMetadata[i], "$['subscription_item.name']");

                if (subscriptionItemName == null) {
                    throw "Invalid subscription_item.name: " + subscriptionItemName;
                }

                var skuId = subscriptionNameToProductCode[subscriptionItemName];

                if (skuId == null) {
                    throw "No product_code found for subscription_item.name: " + subscriptionItemName;
                }

                var config = {
                    "capability_label": this.wdfUtil.getJsonPathValue(globalConfigs[capabilityId], "$.capability_label"),
                    "type": this.wdfUtil.getJsonPathValue(globalConfigs[capabilityId], "$.type"),
                    "ua_definition_id": this.wdfUtil.getJsonPathValue(globalConfigs[capabilityId], "$.ua_definition_id"),
                    "schedule": this.wdfUtil.getJsonPathValue(globalConfigs[capabilityId], "$.schedule"),
                    "exchange_value": exchangeValue,
                    "capability_id": capabilityId,
                    "sku_id": subscriptionNameToProductCode[subscriptionItemName]
                };

                var key = capabilityId;
                if (resultMap[key] == null || config['exchange_value'] < resultMap[key]['exchange_value']) {
                    resultMap[key] = config;
                }

            } catch (e) {
                this.logger.error("Failed to evaluate configuration for metadata: " + JSON.stringify(skuMetadata[i] + ". Error: " + e));
            }
        }
        var result = Object.values(resultMap);
        this.logger.debug("Configurations found: " + JSON.stringify(result));
        return result;
    },

    type: 'LicensingStore'
};
