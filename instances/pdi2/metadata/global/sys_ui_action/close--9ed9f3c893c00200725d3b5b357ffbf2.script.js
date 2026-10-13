function em_close_alert() {
	var gr = new GlideRecord('em_alert_history');
	if (!gr.get(rowSysId))
		return;

	var alertId = gr.getValue("alert_sys_id");
	gr = new GlideRecord('em_alert');
	if (!gr.get(alertId))
		return;
	
	var alertNumber = gr.getValue("number");
	gr.setValue('state', 'Closed');
	if (getEmProperty('evt_mgmt.alert_ack_on_close') == 'true') { // if property is turned on
		gr.setValue('acknowledged',true);
	}
	gr.update();
	
	CustomEvent.fireAll('snc.reportInfo',new GwtMessage().getMessage("Closing {0}", alertNumber));
}

function getEmProperty(propertyName) {
		var gr = new GlideRecord('sys_properties');
		gr.addQuery('name', 'evt_mgmt.alert_ack_on_close');
		gr.query();
		if (gr.next())
			return gr.getValue('value');

		return 'true';

}
