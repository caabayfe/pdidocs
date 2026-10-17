function openQuickResponsePopUp(button) {
		
	var gr = new GlideRecord("em_alert_history");
	gr.addQuery('sys_id',rowSysId);
	gr.query();
	if (gr.next()){
		var alertNumber = gr.getValue('number');
		var orgAlertSysId = gr.getValue('alert_sys_id');
		var message = new GwtMessage().getMessage('Quick Response for {0}', alertNumber); 
		var description = new GwtMessage().getMessage('Description: {0}', gr.getValue('description')); 

		var data = {'type':'quickResponse', 'cid':orgAlertSysId, 'source':'alertHistory','title':message,'subTitle' :description };
		setPreference('alert_id',orgAlertSysId);
		CustomEvent.fireAll('alerts_sa.userActionOnTable')
		CustomEvent.fireAll('em.openBasePopup',data);

	}
	else {
		alert("An alert must be selected for running Quick Response.");
	}

}
