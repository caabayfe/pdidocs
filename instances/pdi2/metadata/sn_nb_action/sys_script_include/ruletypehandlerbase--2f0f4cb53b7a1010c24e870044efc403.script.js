var RuleTypeHandlerBase = Class.create();
RuleTypeHandlerBase.prototype = {
    initialize: function() {},

    /*
     * This identifies the rule type handled by this implementation.
     * Should be name of a table that extends "sn_nb_action_rule_base" table.
     */
    getId: function() {
        //No Op - Should be overriden by an extension
    },

    /*
     * Return an array of GlideRecord actions recommended by this rule
     */
    evaluateRule: function(currentRecord, ruleRecord, recommendationType, contextRecord, ruleContext) {
        //No Op - Should be overriden by an extension
    },

    /*
     * Returns true if the rule is valid
     * This function should be overridden by extension to implement the validation
     */
    isValidRule: function(ruleRecord) {
        //No Op - Should be overriden by an extension
        return true;
    },

    type: 'RuleTypeHandlerBase'
};
