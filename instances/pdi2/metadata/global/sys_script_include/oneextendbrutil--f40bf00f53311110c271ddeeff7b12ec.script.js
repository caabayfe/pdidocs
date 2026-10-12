var OneExtendBRUtil = Class.create();

OneExtendBRUtil.prototype = {
    initialize: function() {
        this.REQUIRED_PLUGIN_MAP = {};
        //Dynamic Translation Capability
        this.REQUIRED_PLUGIN_MAP["b8c0a026530a1110c271ddeeff7b1252"] = ["com.glide.dynamic_translation"];
        this.REQUIRED_PLUGIN_MAP["df6986f853521110c271ddeeff7b1278"] = ["com.sn.va.profanity"];
    },

    _checkIfAllPluginsAreActive: function(required_plugins) {
        var pMgr = new GlidePluginManager();

        var allActive = true;
        for (var idx in required_plugins) {
            var active = pMgr.isActive(required_plugins[idx]);
            allActive = allActive && active;
        }

        return allActive;
    },

    _validatePluginInstallation: function(current, previous) {

        var required_plugins = this.REQUIRED_PLUGIN_MAP[current.sys_id];
        var allActive = this._checkIfAllPluginsAreActive(required_plugins);

        if (!allActive && current.operation() == "update" && current.active && !previous.active) {
            gs.addErrorMessage(gs.getMessage("Please install these plugins to activate this capability definition: {0}", required_plugins.join()));
            current.setAbortAction(true);
        }
    },

    validateBuilderCapabilityOnInsert: function(current, previous) {
        var builderCapabilityGr = new GlideRecord("sys_one_extend_builder_capability");
        builderCapabilityGr.addActiveQuery();
        builderCapabilityGr.addQuery("builder", current.builder);
        builderCapabilityGr.addQuery("definition.capability", current.definition.capability);
        builderCapabilityGr.addQuery("default", true);
        builderCapabilityGr.query();

        var hasDefault = false;

        if (builderCapabilityGr.next()) {
            gs.info("found something");
            hasDefault = true;
        }

        if (hasDefault && current.getValue("default") == true) {
            gs.addErrorMessage(gs.getMessage("There is already a default mapping for this builder with one of the definitions for this capability."));
            current.setAbortAction(true);
        } else if (!hasDefault) {
            gs.info("setting default true");
            current.setValue("default", "true");
        }
    },

    _validateDefaultBuilderCapability: function(current, previous) {
        var hasNoRow = true;
        var builderCapabilityGr = new GlideRecord("sys_one_extend_builder_capability");
        builderCapabilityGr.addActiveQuery();
        builderCapabilityGr.addQuery("builder", current.builder);

        if (current.operation() == "update") {
            builderCapabilityGr.addQuery("sys_id", "!=", current.sys_id);
        }
        builderCapabilityGr.addQuery("definition.capability", current.definition.capability);
        builderCapabilityGr.query();
        while (builderCapabilityGr.next()) {
            hasNoRow = false;
            if (builderCapabilityGr.getValue("default") == true) {
                gs.addErrorMessage(gs.getMessage("There is already a default mapping for this builder with one of the definitions for this capability."));
                current.setAbortAction(true);
            }
        }
        return hasNoRow;
    },

    validateBuilderCapabilityRow: function(current, previous) {
        if (current.operation() == "insert") {
            this.validateBuilderCapabilityOnInsert(current, previous);
        } else if (current.operation() == "update" && current.active == true && current.getValue("default") == true) {
            this._validateDefaultBuilderCapability(current, previous);
        } else if (current.operation() == "update" && current.active == false && previous.active == true) {

            var usageActiveGr = new GlideRecord("sys_one_extend_usage");
            usageActiveGr.addActiveQuery();
            usageActiveGr.addQuery("definition", current.definition);
            usageActiveGr.query();

            if (usageActiveGr.next()) {
                gs.addErrorMessage(gs.getMessage("There is one or more active usage associated with this capability. Please mark all the related usage in sys_one_extend_usage table inactive, before making this capability inactive."));
                current.setAbortAction(true);
            }
        } else if (current.operation() == "delete") {
            var usageGr = new GlideRecord("sys_one_extend_usage");
            usageGr.addQuery("definition", current.definition);
            usageGr.query();

            if (usageGr.next()) {
                gs.addErrorMessage(gs.getMessage("There is one or more usage associated with this capability. Please delete all the related usage before deleting this capability."));
                current.setAbortAction(true);
            }
        }
    },

    type: 'OneExtendBRUtil'
};
