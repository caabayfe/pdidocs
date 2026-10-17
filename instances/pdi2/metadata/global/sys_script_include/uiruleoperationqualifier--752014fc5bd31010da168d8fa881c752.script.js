var UIRuleOperationQualifier = Class.create();
UIRuleOperationQualifier.prototype = {
	MOBILE_VIEW_OPS : ["applyStyle", "disableButton", "setVisible","applyDateFormatter"],
	PARAM_SCREEN_OPS : ["performCalculation", "performDateTimeCalculation", "setMandatory", "setReadOnly", "setVisible", "clearInput", "runClientScript", "executeNowAssistSkill"],

    getQualifier: function() {		
		if (current.ui_rule == "")
			return "name=";
		
		var uiRule = new GlideRecord("sys_sg_ui_rule");
		uiRule.get(current.ui_rule);
		if (uiRule.parent_table == "sys_sg_view_config")
			return "nameIN" + this.MOBILE_VIEW_OPS;
		else if (uiRule.parent_table == "sys_sg_parameter_screen" || uiRule.parent_table == "sys_sg_parameter_section")
			return "nameIN" + this.PARAM_SCREEN_OPS.concat(this.getOneExtendOperations());

		return "";
    },
	
	getOneExtendOperations: function() {
		var oneExtendOperations = [];
		var uiRuleOperation = new GlideRecord("sys_sg_ui_rule_operation");
		uiRuleOperation.query();
		while (uiRuleOperation.next()) {
			if (uiRuleOperation.getValue("one_extend_capability")) {
				oneExtendOperations.push(uiRuleOperation.getValue("name"));
			}
		}
		return oneExtendOperations;
	},

    type: 'UIRuleOperationQualifier'
};
