var CustomRuleHandler = Class.create();
CustomRuleHandler.prototype = Object.extendsObject(sn_nb_action.RuleTypeHandlerBase, {
    initialize: function() {
    },
	
	/*
	 * This identifies the rule type handled by this implementation.
	 * Should be name of a table that extends "sn_nb_action_rule_base" table.
	 */
	getId : function() {
		return "sn_custom_rule";
	},
	
	/*
	 * Return an array of GlideRecord actions recommended by this rule
	 */
    evaluateRule: function(currentRecord, ruleRecord) {
		var actions = [];
		var action1 = new GlideRecord('ga_decision_tree');
		action1.get('sy_id1');
		actions.push(action1);
		
		var action2 = new GlideRecord('ga_decision_tree');
		action2.get('sy_id2');
		action2.push(action2);
		return actions;
    },
    /*
     * Returns true if the rule is valid
     */
    isValidRule: function(ruleRecord) {
        // Add appropriate validation here
        return true;
    },

    type: 'CustomRuleHandler'
});
