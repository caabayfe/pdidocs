var SvcTraversalRulesProvider = Class.create();
SvcTraversalRulesProvider.prototype = {
    initialize: function() {},

	/*
	 * Returns list of traversal rules, ordered by "order" field values.
	 * Example: [{"parent_type":"cmdb_ci_hardware","rel_type":"d93304fb0a0a0b78006081a72ef08444","child_type":"cmdb_ci_vm_instance","reverse":true,"order":100,"used_by":"ServiceByTags","max_depth":1,"active":true},
	 *			 {"parent_type":"cmdb_ci_appl","rel_type":"60bc4e22c0a8010e01f074cbe6bd73c3","child_type":"cmdb_ci_hardware","reverse":true,"order":200,"used_by":"ServiceByTags","max_depth":1,"active":true},
	 *			 {"parent_type":"cmdb_ci_kubernetes_pod","rel_type":"55c95bf6c0a8010e0118ec7056ebc54d","child_type":"cmdb_ci_oslv_container","reverse":false,"order":300,"used_by":"ServiceByTags","max_depth":1,"active":true}]
	 */
    getTraversalRules: function(usedBy) {
        var result = [];

		var strp = new SNC.SvcTraversalRulesProvider();
		var rules = strp.getTraversalRules(usedBy);
		var rulesList = JSON.parse(rules);
		for (var i = 0; i < rulesList.length; i++) {
			result.push(this._toRuleObj(rulesList[i]));
		}
		return result;
    },

    _toRuleObj: function(ruleIn) {
        var rule = {};
        rule.parent_type = ruleIn.parent_type + '';
        rule.rel_type = ruleIn.rel_type + '';
        rule.child_type = ruleIn.child_type + '';
		rule.reverse = ruleIn.reverse == true;
		rule.order = parseInt(ruleIn.order);
        rule.used_by = ruleIn.usedBy + '';
        rule.max_depth = parseInt(ruleIn.maxDepth);
        rule.active = true;

		return rule;
    },

    type: 'SvcTraversalRulesProvider'
};
