function em_maint_alert() {
	
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
		if (gr.getValue('maintenance') == 'true') {
			CustomEvent.fireAll('snc.reportInfo',new GwtMessage().getMessage("{0} is already in maintenance", alertNumber));
		} else {
			
			gr.setValue('maintenance', true);
			gr.update();
			CustomEvent.fireAll('snc.reportInfo',new GwtMessage().getMessage("Update {0} to be in maintenance", alertNumber));
		}
	}
			
}
		
		
