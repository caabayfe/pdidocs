(function executeRule(current, previous /*null when async*/ ) {

    var index = gs.action.getGlideURI().toString().indexOf('unconnected_category_content_list'); // to display only on UI List
	var lastRunDate = gs.getProperty("taxonomy.category.new_content_job_last_run");
    if (index != -1 && lastRunDate) {
        gs.flushMessages();
        var msg = gs.getMessage('This list was last updated on {0}', lastRunDate);
        gs.addInfoMessage(msg);
    }

})(current, previous);
