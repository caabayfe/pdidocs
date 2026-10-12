updateGaugeName();

function updateGaugeName(){
	
	var newTitle = current.chart_title;
	if (newTitle.nil())
		newTitle = current.title;
	
	var gauge = new GlideRecord("sys_gauge");
	gauge.addQuery("type", "report");
	gauge.addQuery("report", current.sys_id);
	gauge.query();
	
	while(gauge.next()) {
		var changed = false;
		if (gauge.title != newTitle) {
			gauge.title = newTitle;
			changed = true;
		}
		if (gauge.name != current.title) {
			gauge.name = current.title;
			changed = true;
		}
		if (gauge.tablename != current.table) {
			gauge.tablename = current.table;
			changed = true;
		}
		if (changed)
			gauge.update();
	}
};
