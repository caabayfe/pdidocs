var CapabilityService = Class.create();
CapabilityService.prototype = {
    initialize: function() {},

    findChildCapabilities: function(parent_capability) {
        var gr = new GlideRecord('sys_one_extend_resource_mapping');
        gr.addQuery('parent_capability', parent_capability);
        gr.query();

        var child_capabilities = [];

        while (gr.next()) {
            var child_capability = gr.getValue('resource_capability');
            child_capabilities.push(child_capability);
        }

        return child_capabilities;
    },

    findProviderAPI: function (capability) {
        var gr = new GlideRecord('sys_one_extend_capability_definition');
        gr.addQuery('capability', capability);
        gr.query();

        if (gr.next()) {
            return gr.getValue('metadata').provider_api;
        }
        return null;
    },

    addCapability: function (parent_capability, capability, active, condition, condition_script, error_policy, error_handler_script, sys_domain) {
        var provider_api = this.findProviderAPI(capability);
        var provider_apis = this.findChildCapabilities(parent_capability).map((child_capability) => this.findProviderAPI(child_capability));
        if (provider_apis.includes(provider_api)) {
            return null;
        }

        var gr = new GlideRecord('sys_one_extend_resource_mapping');
        gr.initialize();
        gr.parent_capability = parent_capability;
        gr.resource_capability = capability;
        gr.active = active;
        gr.condition = condition;
        gr.condition_script = condition_script;
        gr.error_policy = error_policy;
        gr.error_handler_script = error_handler_script;
        gr.sys_domain = sys_domain;

        return gr.insert();
    },

    createCapabilityDefiniton: function (capability_definition) {
        var gr = new GlideRecord('sys_one_extend_capability_definition');
        gr.initialize();
        gr.name = capability_definition.name;
        gr.capability = capability_definition.capability;
        gr.api_type = capability_definition.api_type;
        gr.api = capability_definition.api;
        gr.category = capability_definition.category;
        gr.description = capability_definition.description;
        gr.filter_properties = capability_definition.filter_properties;
        gr.advanced = capability_definition.advanced;
        gr.truncate_strategy = capability_definition.truncate_strategy;
        gr.preprocessor = capability_definition.preprocessor;
        gr.postprocessor = capability_definition.postprocessor;
        gr.sys_domain = capability_definition.sys_domain;

        // metadata to contain scope, namespace, provider_api
        gr.metadata = capability_definition.metadata;
        return gr.insert();
    },

    
    createCapability: function(capability_details){
        var gr = new GlideRecord('sys_one_extend_capability');
        gr.initialize();
        gr.name = capability_details.name;
        gr.active = capability_details.active;
        gr.description = capability_details.description;
        gr.type = capability_details.type;
        gr.sys_domain = capability_details.sys_domain;
        return gr.insert();
    },

    createCapabilityAttribute: function(capability_attribute_details){
        var gr = new GlideRecord('sys_one_extend_definition_attribute');
        gr.initialize();
        gr.name = capability_attribute_details.name;
        gr.mandatory = capability_attribute_details.mandatory;
        gr.definition = capability_attribute_details.definition;
        gr.capability = capability_attribute_details.capability;
        gr.type = capability_attribute_details.type;
        gr.data_type = capability_attribute_details.data_type;
        gr.active = capability_attribute_details.active;
        gr.hidden = capability_attribute_details.hidden;
        gr.contains_large_input = capability_attribute_details.contains_large_input;
        gr.translate = capability_attribute_details.translate;
        gr.truncate = capability_attribute_details.truncate;
        gr.apply_filter = capability_attribute_details.apply_filter;
        gr.attribute_label = capability_attribute_details.attribute_label;
        gr.sys_domain = capability_attribute_details.sys_domain;
        gr.order = capability_attribute_details.order;
        return gr.insert();
    },

    setParamValue: function (input) {
        var resource_mapping;
        if (input.resource_mapping) {
            resource_mapping = input.resource_mapping;
        }
        else {
            resource_mapping = this.addCapability(parent_capability, capability, input.active || true, input.condition || null, input.condition_script || null, input.error_policy || "continue", input.error_handler_script || null, input.sys_domain || "global");
        }

        input.params.forEach((param) => {
            var gr = new GlideRecord('sys_one_extend_resource_param_value');
            gr.initialize();
            gr.param_name = param.name;
            gr.param_value = param.value;
            gr.resource_mapping = resource_mapping;
            gr.insert();
        })
    },

    setResourceAttributeMapping: function (input) {
        var resource_mapping;
        if (input.resource_mapping) {
            resource_mapping = input.resource_mapping;
        }
        else {
            resource_mapping = this.addCapability(parent_capability, capability, input.active || true, input.condition || null, input.condition_script || null, input.error_policy || "continue", input.error_handler_script || null, input.sys_domain || "global");
        }

        input.params.forEach((param) => {
            var gr = new GlideRecord('sys_one_extend_resource_attribute_mapping');
            gr.initialize();
            gr.resource_attribute_name = param.resource_attribute_name;
            gr.resource_attribute_value = param.resource_attribute_value;
            gr.resource_mapping = resource_mapping;
            gr.script = param.script || null;
            gr.insert();
        })
    },

    type: 'CapabilityService'
};
