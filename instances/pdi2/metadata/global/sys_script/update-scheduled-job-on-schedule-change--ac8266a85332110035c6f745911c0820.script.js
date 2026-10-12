var nowdt = new GlideDateTime();
nowdt.setDisplayValue(gs.nowDateTime());

var gr = new GlideRecord("sys_trigger");
if (gr.get(current.job)) {
	gr.trigger_type = current.schedule_period;
	gr.next_action = nowdt;
	gr.run_dayofmonth = nowdt.getDayOfMonth();
	gr.run_dayofweek = nowdt.getDayOfWeek();
	gr.run_month = nowdt.getMonth();
	gr.update();
}
