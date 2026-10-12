(function executeRule(current, previous /*null when async*/) {
	
	/* After widget creation, if user changes the aggregate of indicator,then we need to update 
	   the widget, as multiple_elements_view column depends on it.
	*/
	SNC.PAMultiElementUtil.syncAggregateTypeWhenIndicatorValueChanges(current.sys_id);
	
})(current, previous);
