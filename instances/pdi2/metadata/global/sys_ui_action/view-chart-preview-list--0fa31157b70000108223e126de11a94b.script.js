function viewChartList() {

	var SYSPARM_TRANSACTION_SCOPE = "sysparm_transaction_scope";
	var scope = SYSPARM_TRANSACTION_SCOPE + '=' + devStudioAPI.appMetadata.APP_ID;
	var url;
	var key = {
		type: 'form',
		table: 'sys_sg_chart_list',
		sysId: -1,
		recordType: 'sys_sg_chart_list'
	};

	if(isDevStudio) {
		url = '$sg-studio.do?' + scope + '&sysparm_nostack=true#/chartList';
		devStudioAPI.openArbitraryTab(url, 'Chart Previews', 'Chart Preview List', key);
	}
	else {
		url = "sys_sg_chart_list.do?sys_id=-1";
		openStudioTab(url, "Chart Previews", "Chart Preview List");
	}

}
