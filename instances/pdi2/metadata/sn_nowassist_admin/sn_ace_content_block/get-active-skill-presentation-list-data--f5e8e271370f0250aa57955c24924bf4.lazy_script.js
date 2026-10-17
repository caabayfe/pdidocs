
(function(context, pageParams, blockcontext){
	// return some_output
	var data = NAASkillConfigUtil.getOtherActiveSkillsPresentationListData();
	data = NAASkillConfigUtil._pruneCustomActiveSkillsByRoutingMatrix(data);
	var activeSkillsColumnData = [];
	var activeSkillsRowData = {};
	var activeSkillsCount = 0;
	var showActiveSkillList = false;
	if(!gs.nil(data)){
		activeSkillsColumnData = data.columnsData;
		activeSkillsRowData = data.rowsData;
		activeSkillsCount = data.rowsData.rows.length;
		if(activeSkillsCount > 0)
			showActiveSkillList = true;
		}
	return {
		activeSkillsColumnData: activeSkillsColumnData,
		activeSkillsRowData: activeSkillsRowData,
		activeSkillsCount: activeSkillsCount,
		activeTabLabel : sn_i18n.Message.getMessage("sn_nowassist_admin","Active"),
		showActiveSkillList: showActiveSkillList,
		defaultErrorMessage: sn_i18n.Message.getMessage("sn_nowassist_admin","Error occurred. Please contact administrator."),
		deactivateLoaderLabel: sn_i18n.Message.getMessage("sn_nowassist_admin","Deactivating skill"),
		deactivateContent: sn_i18n.Message.getMessage("Error occurred while deactivating skill. Please contact administrator."),
		nowAssistSkillsTranslated: sn_i18n.Message.getMessage("sn_nowassist_admin","Now Assist Skills")
	};
})(context, pageParams, blockcontext);
