var AutoReflowRule = Class.create();
AutoReflowRule.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
	TABLE: 'sys_ux_auto_reflow_rule',
	FIELDS: ['name', 'component', 'max_width', 'css', 'property_values'],
    initialize: function(fields) {
		BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS);
    },
	getRecordsByQuery: function() {
		const autoReflowRules = BuilderToolkitAPIBase.prototype.getRecordsByQuery.call(this, '', 'name');
		return autoReflowRules;
	},

    type: 'AutoReflowRule'
});
