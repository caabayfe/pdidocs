(function executeRule(current, previous /*null when async*/) {
	var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
  var messageArray = [];
  messageArray.push(GlideStringUtil.escapeHTML(current.getElement('planning_item_type')));
  messageArray.push(GlideStringUtil.escapeHTML(current["planning_item_id"].sys_class_name));
  messageArray.push(GlideStringUtil.escapeHTML(current["planning_item_id"].sys_class_name));
  messageArray.push(GlideStringUtil.escapeHTML(goalLabel));
  var errorMessage = gs.getMessage('Selected Planning item type is "{0}" but the "{1}" is of type "{2}". A {3} relationship can be created only when the planning item belongs to the same Planning item type.', messageArray);
	gs.addErrorMessage(errorMessage);

})(current, previous);
