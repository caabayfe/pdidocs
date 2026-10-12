function showLiveFeedList() {
	var sysId = g_sysId;
	var table = g_list.getTableName();
	var modal = new GlideModal('showLiveFeed' + sysId, false, 600);
	modal.setTitle('Live Feed');
	modal.setAutoFullHeight(true);
	modal.renderIframe('show_live_feed.do?sysparm_stack=no&sysparm_sys_id=' + sysId + '&sysparm_table=' + table);
}
