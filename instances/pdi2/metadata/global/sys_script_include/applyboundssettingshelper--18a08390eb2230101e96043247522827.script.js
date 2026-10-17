var ApplyBoundsSettingsHelper = Class.create();

ApplyBoundsSettingsHelper.prototype = {

    initialize: function() {},

    applyBoundsOnConfigRuleUpdateOrDelete: function(current, previous) {

        var operation = current.operation();

        /*
         * If operation is update, then check changes of 
         * encoded rules, if no changes, then exit
         */
        if (operation == "update") {
            if (current.rule == previous.rule) 
                return;
        }

        var configRuleSysID = current.getUniqueValue();

        if (!this.hasRecordOfMetricClass(configRuleSysID)) 
            return;
        
        /*
         * Update is relevant, so create event and send it
         */
        var currentFilter = current.rule.toString();
        var previousFilter = (operation == "update") ? previous.rule.toString() : null;
        this.addToQueue(configRuleSysID, operation, currentFilter, previousFilter);
		
		if (operation == "delete") 
			this.displayInfo();		
    },

    applyBoundsOnMetricClassUpdate: function(current, previous) {

        /* 
         * Check that values related to bounds were changed.
         * All other changes are irrelevant.
         */
        if (!this.areValuesChanged(current, previous)) 
            return;
        
        var configRuleSysID = this.getConfigRuleSysID(current);
        if (configRuleSysID == null) 
            return;
        
        var filter = this.getEncodedRule(configRuleSysID);
        if (filter == null) 
            return;

        this.addToQueue(configRuleSysID, current.operation(), filter, null);

    },

    applyBoundsOnConfigSettingsInsert: function(current, previous) {

        var configRuleSysID = current.rule;

        var filter = this.getEncodedRule(configRuleSysID);
        if (filter == null) 
            return;

        this.addToQueue(configRuleSysID, current.operation(), filter, null);
    },

    /*
     * Retrieves filters from system event
     */
    getFiltersForLearner: function(event) {

        var jsonStr = event.parm2;
        var jsonObject = this.decodeJson(jsonStr);

        var filters = [];
        filters.push(jsonObject.currentFilter);
        
		if (jsonObject.previousFilter != null) 
            filters.push(jsonObject.previousFilter);

        return filters;
    },

    handleRefresh: function(current) {

        var configRuleSysID = current.getUniqueValue();
        var filter = current.rule.toString();

        this.addToQueue(configRuleSysID, "refresh", filter, null);
        this.displayInfo();
    },

    addToQueue: function(configRuleSysID, operation, currentFilter, previousFilter) {

        var jsonString = this.createJson("filter", operation, currentFilter, previousFilter);

        if (jsonString == null) 
            return;

        gs.eventQueue("mi.learning.job.invocation", null, configRuleSysID, jsonString);
    },

    /*
     * Returns true if sa_metric_config_rule_setting table contains
     * a record that references to the given sys ID (rule field)
     * and it also references to metric class (name field)
     * Parameter sysID is configuration rule sys ID (sa_metric_config_rule table)
     */
    hasRecordOfMetricClass: function(configRuleSysID) {

        var gr = new GlideRecord('sa_metric_config_rule_setting');
        gr.addQuery('rule', configRuleSysID);
        gr.query();

        while (gr.next()) {
            var className = gr.getElement('name').getDisplayValue();
            if (className == 'sa_metric_class') 
                return true;
        }

        return false;
    },

    /*
     * Creates json string
     * Parameters:
     *    type is learning type
     *    operation is operation type (update/delete/insert)
     *    filters are encoded queries for CI/Metrics filtering
     */
    createJson: function(type, operation, currentFilter, previousFilter) {

        var object = {
            type: type,
            operation: operation,
            currentFilter: currentFilter,
            previousFilter: previousFilter
        };

        var parser = new JSON();
        return parser.encode(object);
    },

    decodeJson: function(jsonString) {
        var parser = new JSON();
        return parser.decode(jsonString);
    },

    /*
     * Returns true if any of bounds-related values are changed
     */
    areValuesChanged: function(current, previous) {

        if (previous.lower_bound_delta != current.lower_bound_delta) 
            return true;

        if (previous.lower_width_override != current.lower_width_override)
            return true;

        if (previous.max_lower_bound != current.max_lower_bound)
            return true;

        if (previous.max_upper_bound != current.max_upper_bound)
            return true;

        if (previous.min_lower_bound != current.min_lower_bound)
            return true;

        if (previous.min_upper_bound != current.min_upper_bound)
            return true;

        if (previous.upper_bound_delta != current.upper_bound_delta)
            return true;

        if (previous.upper_width_override != current.upper_width_override)
            return true;

        return false;
    },

    /*
     * Returns configuration rule Sys ID from
     * sa_metric_config_rule_setting table using
     * sa_metric_class record Sys ID
     */
    getConfigRuleSysID: function(current) {

        var gr = new GlideRecord('sa_metric_config_rule_setting');
        gr.addQuery('setting_reference_value', current.getUniqueValue());
        gr.query();

        return gr.next() ? gr.getValue('rule') : null;
    },

    /*
     * Returns encoded rule (filter) of a record 
     * with the given configuration rule Sys ID
     */
    getEncodedRule: function(configRuleSysID) {

        gr = new GlideRecord('sa_metric_config_rule');
        gr.addQuery('sys_id', configRuleSysID);
        gr.query();

        return gr.next() ? gr.getValue('rule') : null;
    },
	
	displayInfo: function() {
		
		var message = gs.getMessage("Processing of bounds settings started. It may take several minutes");
        gs.addInfoMessage(message);
    },

    type: 'ApplyBoundsSettingsHelper'
};
