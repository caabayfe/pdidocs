function transform(input) {
	var output = {};
	var recommendedCardProps = [];
	var uibCollabUtils = new sn_uib_collab.CollabUtils();
	output.collabDropdownParams = uibCollabUtils.getDropDownPanelContents();
	var hasChats = new ContextualPanelTeamsConfigSNC().hasChats(input.recordSysId);	
	output.hasChats = hasChats;
	if (!hasChats) {
		recommendedCardProps = uibCollabUtils.getRecommededUsers(input.recordSysId, input.tableName);
	}
	output.recommededCardProps =  recommendedCardProps;
  return output;
}
