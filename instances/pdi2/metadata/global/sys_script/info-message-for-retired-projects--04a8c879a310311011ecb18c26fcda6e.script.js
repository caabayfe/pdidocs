(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.isProjectRetired = current.status == "RETIRED";
	g_scratchpad.autoCleanDays = gs.getProperty("promin.auto_clean_days", 90);
	var isProjectStateNew = current.state == 'NEW';
	if(g_scratchpad.isProjectRetired) {
		var retiredDate = new GlideDateTime(current.retired_date);
		var currentDate = new GlideDateTime();
		var difference = GlideDateTime.subtract(retiredDate, currentDate);
		if(!isProjectStateNew){
			retiredDate.addDays(g_scratchpad.autoCleanDays);
			difference = GlideDateTime.subtract(currentDate, retiredDate);
		}
		var days = difference.getRoundedDayPart();
		if(!isProjectStateNew && days > 0) {
			gs.addInfoMessage( gs.getMessage("This project has the status set to 'Retired'. Note: This retired project will be cleaned after {0} days. Please update the status to retain your data or generate the model", [days]));
		} else if(!gs.nil(current.last_mined_time)) {
			gs.addInfoMessage( gs.getMessage("This project's data has been cleaned since it has been {0} days since it was retired. Please generate the model again to view results. Contact the system administrator to change the cleaning settings.", [days]));
		}	
	}

})(current, previous);
