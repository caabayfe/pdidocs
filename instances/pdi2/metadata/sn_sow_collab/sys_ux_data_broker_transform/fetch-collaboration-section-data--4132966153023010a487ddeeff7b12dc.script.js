function transform(input) {
	var output = {};
	var recommendedCardProps = [];
	var sowCollabUtils = new sn_sow_collab.SowCollabUtils();
	output.collabDropdownParams = sowCollabUtils.getDropDownPanelContents();
	var hasChats = new SOWContextualPanelTeamsConfigSNC().hasChats(input.recordSysId);	
	output.hasChats = hasChats;
	if (!hasChats) {
		recommendedCardProps = sowCollabUtils.getRecommededUsers(input.recordSysId, input.tableName);
	}
	output.recommededCardProps =  recommendedCardProps;
  return output;
}
