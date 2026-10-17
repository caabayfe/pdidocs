var check = new GlideRecord("pa_job_indicators");

check.addQuery("job", current.job);
check.addQuery("indicator", current.indicator);	
check.query();

var another = false;
while (check.next() && another == false) {
	another = (check.sys_id != current.sys_id);
}

if (another) {
	gs.addErrorMessage(gs.getMessage("Indicator is already related to this job"));
	current.setAbortAction(true);
}	
