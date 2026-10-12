(function executeRule(current, previous /*null when async*/) {
	//Delete the list before the view because list update saver
	//needs to have the view name available because of its special
	//update saver.
	var listGR = new GlideRecord("sys_ui_list");
	listGR.addQuery("view", current.sys_id);
	listGR.query();
	while (listGR.next())
		listGR.deleteRecord();

})(current, previous);
