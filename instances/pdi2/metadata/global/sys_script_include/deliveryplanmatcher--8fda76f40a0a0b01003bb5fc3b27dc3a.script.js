gs.include("PrototypeServer");
var DeliveryPlanMatcher = Class.create();

DeliveryPlanMatcher.prototype = {
	initialize : function(/*GlideRecord*/ gr) {
		this.toMatch = gr;
		this.tableName = gr.getRecordClassName() + '';
	},

	getPlan : function() {
		var plans = new GlideRecord('sc_cat_item_delivery_plan');
		plans.addQuery('parent_table', this.tableName);
		plans.orderBy('order');
		plans.addActiveQuery();
		plans.query();
		while (plans.next()) {
			if (this._matchMe(plans))
				return plans.sys_id + '';
		}
		return null;
	},

	_matchMe : function(/*GlideRecord*/ plan) {
		if (plan.condition.nil() && plan.script.nil())
			return true;

		if (!plan.condition.nil() && !plan.script.nil())
		   return GlideFilter.checkRecord(this.toMatch, plan.condition) && (GlideEvaluator.evaluateString(plan.script + '') + "" == 'true');

		if (!plan.condition.nil())
			return GlideFilter.checkRecord(this.toMatch, plan.condition);

		if (!plan.script.nil())
			return (GlideEvaluator.evaluateString(plan.script + '') + "" == 'true');

   }
}
