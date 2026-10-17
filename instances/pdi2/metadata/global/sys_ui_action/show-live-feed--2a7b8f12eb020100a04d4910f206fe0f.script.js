function showLiveFeedList() {
	var sysId = g_sysId;
	var box = GlideBox.get('showLiveFeed_' + sysId);
	if (box)
		box.close(0);
	
	var table = g_list.getTableName();
	box = new GlideBox({
		id: 'showLiveFeed_' + sysId,
		iframe : 'show_live_feed.do?sysparm_sys_id=' + sysId + "&sysparm_table=" + table + "&sysparm_is_formatter=false",
			width : 600,
		height : "95%",
		title : "Live Feed",
		noTitle : true
	});
	
	box.render();
	
	var g_feedResizer;
	Event.observe(window, 'resize', function() {
		g_feedResizer = setTimeout(function() {
			box.autoPosition();
			box.autoDimension();
		}, 50);
	});
}
