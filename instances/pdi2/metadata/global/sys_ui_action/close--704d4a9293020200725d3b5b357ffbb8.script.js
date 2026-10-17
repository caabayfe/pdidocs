function em_close_alert() {
	
	var selSysIds = g_list.getChecked();
    var sysIdList = selSysIds.split(',');
	
	if (typeof(rowSysId) !== "undefined" && rowSysId !== undefined)
		sysIdList.push(rowSysId);
	
	var isAck = "true";
	if (sysIdList.length > 0) {
		isAck = getEmProperty('evt_mgmt.alert_ack_on_close');
	}
	
	for (var i = 0; i < sysIdList.length; i++) {
		var id = sysIdList[i];
	
		var gr = new GlideRecord('em_alert');
		if (!gr.get(id))
			continue;
		
		var alertNumber = gr.getValue("number");

		gr.setValue('state', 'Closed');
		if (isAck == 'true') { // if property is turned on
			gr.setValue('acknowledged',true);
		}
		gr.update();
	
		CustomEvent.fireAll('snc.reportInfo',new GwtMessage().getMessage("Closing {0}", alertNumber));
	}

	g_list.refresh();
}

function getEmProperty(propertyName) {
		var gr = new GlideRecord('sys_properties');
		gr.addQuery('name', 'evt_mgmt.alert_ack_on_close');
		gr.query();
		if (gr.next())
			return gr.getValue('value');

		return 'true';

}
