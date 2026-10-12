var UIRuleOperationService = Class.create();
UIRuleOperationService.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	checkOperation: function() {
		var gr = new GlideRecord('sys_sg_ui_rule_operation');
		
		if (!gr.canRead())
			return this._getResult(false, false, false);

		var uiRuleOperationSysId = this.getParameter('sysparm_ui_rule_operation_sys_id');
		gr.get(uiRuleOperationSysId);
		
		if (!gr.canRead())
			return this._getResult(false, false, false);
			
		var oneExtendCapabilityId = gr.getValue('one_extend_capability');
		if(!oneExtendCapabilityId)
			return this._getResult(true, false, false);

		var apiAttrs = sn_one_extend.OneExtendUtil.getCapabilityAttributes(oneExtendCapabilityId);
		var hasMultipleOutputs = apiAttrs && apiAttrs.outputs && apiAttrs.outputs.length > 1;
		return this._getResult(true, true, hasMultipleOutputs);
	},

	_getResult: function(hasAccessToTable, isOneExtendOperator, hasMultipleOutputs) {
		return JSON.stringify({
		    hasAccessToTable: hasAccessToTable,
			isOneExtendOperator: isOneExtendOperator,
			hasMultipleOutputs: hasMultipleOutputs
		});
	},

    type: 'UIRuleOperationService'
});
