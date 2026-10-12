(function executeRule(current, previous /*null when async*/) {
	var cxsUiActConfigUtil = new global.cxs_UIActionConfig(false);
	if (current.operation() == 'delete') {
		if (current.primary_action.nil() && current.additional_actions.nil())
			return;
		
		cxsUiActConfigUtil.deleteUACFromTrendRec(current.sys_id, '');
	}
	else if (current.primary_action.changes() || current.additional_actions.changes())
		cxsUiActConfigUtil.buildUACFromTrendRec(current);

})(current, previous);
