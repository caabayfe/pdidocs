var ConfigurationStore = Class.create();
ConfigurationStore.prototype = {
    initialize: function() {
        this.logger = new WdfLogger();
    },

    getActiveConfigurations: function() {
        var usageConfigurationGR = new GlideRecord("sn_wdf_token_usage_configuration");
        usageConfigurationGR.addActiveQuery();
        usageConfigurationGR.query();

        this.logger.debug("Found " + usageConfigurationGR.getRowCount() + " active usage configurations with query " + usageConfigurationGR.getEncodedQuery() + ".");

        return usageConfigurationGR;
    },

    processConfigurations: function(configurations) {
        if (configurations == null) {
            throw "Configuration list cannot be null.";
        }

        var configurationMapping = this.createConfigurationMapping(configurations);

        var usageConfigurationGR = new GlideRecord("sn_wdf_token_usage_configuration");
        usageConfigurationGR.query();

        while (usageConfigurationGR.next()) {
            try {
                var capabilityId = usageConfigurationGR.getValue("capability_id");

                var key = this.createIndex(capabilityId);

				if (key == null) {
					throw "Invalid key generated: " + key;
				}

                if (configurationMapping[key] == null && usageConfigurationGR.getValue("active") == false) {
                    //obsolete glide wdf configuration is already inactive
                    this.logger.debug("Skipping obsolete, inactive configuration: " + usageConfigurationGR.getUniqueValue() + ", for index: " + key);
                    continue;
                } else if (configurationMapping[key] == null && usageConfigurationGR.getValue("active") == true) {
                    //deactivate existing glide wdf configuration
                    usageConfigurationGR.setValue("active", false);

                    this.logger.debug("Deactivating configuration: " + usageConfigurationGR.getUniqueValue() + ", for index: " + key);
                    usageConfigurationGR.update();
                } else if (configurationMapping[key] != null) {
                    var configuration = configurationMapping[key];
                    configurationMapping[key] = undefined;

                    var skuId = configuration["sku_id"];
                    var capabilityLabel = configuration["capability_label"];
                    var type = configuration["type"];
                    var uaDefinitionId = configuration["ua_definition_id"];
                    var schedule = configuration["schedule"];
                    var exchangeValue = configuration["exchange_value"];

                    if (
                        capabilityId == null || capabilityId == "" ||
                        skuId == null || skuId == "" ||
                        capabilityLabel == null || capabilityLabel == "" ||
                        type == null || type == "" ||
                        uaDefinitionId == null || uaDefinitionId == "" ||
                        schedule == null || schedule == "" ||
                        exchangeValue == null || isNaN(exchangeValue) || exchangeValue < 0) {
                        this.logger.error("Invalid update configuration value: " + JSON.stringify(configuration));
                        continue;
                    }

                    usageConfigurationGR.setValue("active", true);
                    usageConfigurationGR.setValue("sku_id", skuId); // write the resolved lowest-exchange SKU
                    usageConfigurationGR.setValue("capability_label", capabilityLabel);
                    usageConfigurationGR.setValue("type", type);
                    usageConfigurationGR.setValue("ua_definition_id", uaDefinitionId);
                    usageConfigurationGR.setValue("schedule", schedule);
                    usageConfigurationGR.setValue("exchange_value", exchangeValue);
                    usageConfigurationGR.setValue("product_family", this.getProductFamily(capabilityId));

                    this.logger.debug("Updating configuration: " + usageConfigurationGR.getUniqueValue() + ", for index: " + key);
                    usageConfigurationGR.update();
                }
            } catch (e) {
                this.logger.error("Failed to update configuration record: " + usageConfigurationGR.getUniqueValue() + ". Error: " + e);
            }
        }

        var configurationMappingKeys = Object.keys(configurationMapping);
        this.logger.debug("Configuration keys remaining: " + JSON.stringify(configurationMappingKeys));

        for (var i = 0; i < configurationMappingKeys.length; i++) {
            try {
                var newKey = configurationMappingKeys[i];
                var newConfiguration = configurationMapping[newKey];
                // skip entries already consumed by the update loop (set to undefined)
                if (newConfiguration == null) {
                    continue;
                }
                //insert new configurations
                var newCapabilityId = newConfiguration["capability_id"];
                var newSkuId = newConfiguration["sku_id"];

                var newCapabilityLabel = newConfiguration["capability_label"];
                var newType = newConfiguration["type"];
                var newUaDefinitionId = newConfiguration["ua_definition_id"];
                var newSchedule = newConfiguration["schedule"];
                var newExchangeValue = newConfiguration["exchange_value"];

                if (
                    newCapabilityId == null || newCapabilityId == "" ||
                    newSkuId == null || newSkuId == "" ||
                    newCapabilityLabel == null || newCapabilityLabel == "" ||
                    newType == null || newType == "" ||
                    newUaDefinitionId == null || newUaDefinitionId == "" ||
                    newSchedule == null || newSchedule == "" ||
                    newExchangeValue == null || isNaN(newExchangeValue) || newExchangeValue < 0) {
                    this.logger.error("Invalid new configuration value: " + JSON.stringify(newConfiguration));
                    continue;
                }

                usageConfigurationGR.initialize();
                usageConfigurationGR.setValue("capability_id", newCapabilityId);
                usageConfigurationGR.setValue("sku_id", newSkuId);
                usageConfigurationGR.setValue("active", true);
                usageConfigurationGR.setValue("capability_label", newCapabilityLabel);
                usageConfigurationGR.setValue("type", newType);
                usageConfigurationGR.setValue("ua_definition_id", newUaDefinitionId);
                usageConfigurationGR.setValue("schedule", newSchedule);
                usageConfigurationGR.setValue("exchange_value", newExchangeValue);
                usageConfigurationGR.setValue("product_family", this.getProductFamily(newCapabilityId));

                this.logger.debug("Creating new configuration for index: " + this.createIndex(newCapabilityId));

                usageConfigurationGR.insert();
            } catch (e) {
                this.logger.error("Failed to insert configuration record: " + usageConfigurationGR.getUniqueValue() + ". Error: " + e);
            }
        }
    },

    createConfigurationMapping: function(configurations) {
        var configurationMapping = {};

        if (configurations == null) {
            throw "Configuration list cannot be null.";
        }

        for (var i = 0; i < configurations.length; i++) {
            var configuration = configurations[i];

            var capabilityId = configuration["capability_id"];
            var index = this.createIndex(capabilityId);

            configurationMapping[index] = configuration;
        }

        this.logger.debug("Configuration mapping: " + JSON.stringify(configurationMapping));

        return configurationMapping;
    },

    createIndex: function(capabilityId, skuId) {
        return capabilityId;
    },

    getProductFamily: function(capabilityId) {
        var mapping = {
            "INTEGRATION_HUB_TRANSACTIONS": "Integration Hub",
            "INTEGRATION_HUB_ORCHESTRATIONS": "Integration Hub",
            "ZERO_COPY_CONNECTORS": "Zero Copy Connectors",
            "ZERO_COPY_CONNECTORS_ERP_OUTBOUND": "Zero Copy Connectors",
            "ZERO_COPY_CONNECTORS_ERP_INBOUND": "Zero Copy Connectors",
            "RPA_UNATTENDED_BOTS": "RPA",
            "RPA_ATTENDED_BOTS": "RPA"
        };

        if (capabilityId == null || capabilityId == "") {
            return "";
        }

        var productFamily = mapping[capabilityId];
        if (productFamily == null) {
            this.logger.debug("Unknown capabilityId: " + capabilityId);
            return "";
        }

        return productFamily;
    },

    type: 'ConfigurationStore'
};
