function showLiveFeed() {
   var box = GlideBox.get('showLiveFeed');
   if (box)
	  box.close(0);
  
    var sysId = g_form.getUniqueValue();
    var table = g_form.getTableName();
	box = new GlideBox({
	    id: 'showLiveFeed',
		iframe : 'show_live_feed.do?sysparm_sys_id=' + sysId + "&sysparm_table=" + table + "&sysparm_is_formatter=false",
		width : 600,
		height : '95%',
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
