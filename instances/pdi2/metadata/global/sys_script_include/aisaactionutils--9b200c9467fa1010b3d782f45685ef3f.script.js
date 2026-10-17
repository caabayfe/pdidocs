var AISAActionUtils = Class.create();
AISAActionUtils.prototype = {
    initialize: function() {
    },
	getActionsForSearchApp: function(searchAppSysId) {
		var actionGr = new GlideRecord('aisa_ui_action');
		actionGr.addActiveQuery();
		if (GlideStringUtil.isEligibleSysID(searchAppSysId)) {
			actionGr.addQuery('search_app', searchAppSysId)
				.addOrCondition('search_app', 'ISEMPTY', '');
		} else
			actionGr.addNullQuery('search_app');
		actionGr.orderBy('action_id');
		actionGr.query();
		var actions = [];
		while (actionGr.next()) {
			actions.push(this._getActionObjectFromGr(actionGr));
		}
		return actions;
	},

	_getActionObjectFromGr: function(actionGr) {
		var actionObj = {};
		actionObj.sysId = actionGr.getUniqueValue();
		actionObj.actionId = actionGr.getValue('action_id');
		actionObj.actionLabel = actionGr.getDisplayValue('action_label');
		actionObj.restPath = actionGr.rest_resource.relative_path + '';
		actionObj.resultTable = actionGr.getValue('result_table');
		actionObj.isCardAction = !!actionGr.is_card_action;
		actionObj.isDetailAction = !!actionGr.is_detail_action;
		actionObj.searchApp = actionGr.getValue('search_app');
		actionObj.scriptedVisibility = !!actionGr.scripted_visibility;
		actionObj.visibilityScript = actionGr.getValue('ui_action_visibility_script');
		actionObj.resultTableCondition = actionGr.getValue('result_table_condition');
		return actionObj;
	},

    type: 'AISAActionUtils'
};
