function onAfter(current, previous) {
   //This function will be automatically called when this rule is processed.
	var scheduledMoreThanOnce = false;
	var repId = current.report;
	
	//search if there are other schedule entries for this report
	var grIsScheduled = new GlideRecord('sysauto_report');
	grIsScheduled.addQuery('report',repId);
	grIsScheduled.query();
	
	if(grIsScheduled.next()){
		scheduledMoreThanOnce = true;
		gs.logDebug("Report with sys_id=" + repId + " is_scheduled=true");
	}

	if (!scheduledMoreThanOnce) {
		var grReportScheduled = new GlideRecord('sys_report');
		grReportScheduled.addQuery('sys_id', repId);
		grReportScheduled.query();
		if (grReportScheduled.next()){
			grReportScheduled.is_scheduled = false;
			grReportScheduled.update();
			gs.logDebug("Report with sys_id=" + repId + " now is_scheduled=false");
		}
	}

   
}
