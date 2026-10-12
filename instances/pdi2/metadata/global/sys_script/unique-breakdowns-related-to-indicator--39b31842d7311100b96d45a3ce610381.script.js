var check = new GlideRecord("pa_indicator_breakdowns");

check.addQuery("breakdown", current.breakdown);
check.addQuery("indicator", current.indicator);	
check.query();

var another = false;
while (check.next() && another == false) {
	another = (check.sys_id != current.sys_id);
}

if (another) {
	gs.addErrorMessage(gs.getMessage("Breakdown is already related to this indicator"));
	current.setAbortAction(true);
}
