(function shouldRenderOverviewTab(params) {
    var tabUtil = new sn_sow.SOWTeamsRecordTabsUtil();

    var tab = tabUtil.TABS.TEAM_MEMBERS;
    var table = params.data.table;
    var sysId = params.data.sysId;

    return tabUtil.shouldRenderTab(tab, table, sysId);
	
})(inputProperties);
