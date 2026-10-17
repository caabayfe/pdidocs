function em_ack_alert() {
	var selSysIds = g_list.getChecked();
    var sysIdList = selSysIds.split(',');
	
	if (typeof(rowSysId) !== "undefined" && rowSysId !== undefined)
		sysIdList.push(rowSysId);
	
	for (var i = 0; i < sysIdList.length; i++) {
		var id = sysIdList[i];
		var gr = new GlideRecord('em_alert');
		if (!gr.get(id))
			continue;
	
		var alertNumber = gr.getValue("number");
		if (gr.getValue('acknowledged') == 'true') {
			CustomEvent.fireAll('snc.reportInfo',new GwtMessage().getMessage("{0} is already acknowledged", alertNumber));
		}
		
		else {
			
			gr.setValue('acknowledged', true);
			gr.update();
			CustomEvent.fireAll('snc.reportInfo',new GwtMessage().getMessage("Acknowledging {0}", alertNumber));
		}
	}		
			
}
		
		
