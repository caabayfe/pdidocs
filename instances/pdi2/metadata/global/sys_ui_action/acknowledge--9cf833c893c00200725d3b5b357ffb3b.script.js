function em_ack_alert() {

	var gr = new GlideRecord('em_alert_history');
	if (!gr.get(rowSysId))
		return;
	
	var alertNumber = gr.getValue("number");
	if (gr.getValue('acknowledged') === 'true') {
		CustomEvent.fireAll('snc.reportInfo',new GwtMessage().getMessage("{0} is already acknowledged", alertNumber));
		return;
	}
	
	var alertId = gr.getValue("alert_sys_id");
	gr = new GlideRecord('em_alert');
	if (!gr.get(alertId))
		return;
	
	gr.setValue('acknowledged', true);
	gr.update();
	
 	CustomEvent.fireAll('snc.reportInfo',new GwtMessage().getMessage("Acknowledging {0}", alertNumber));
}
