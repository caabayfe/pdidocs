function openQuickResponsePopUp(button) {

	var currentSysId = '';
	
	if ((typeof(rowSysId) ==="undefined") ||  (!(rowSysId))) { //row doesn't exist, might be because of multiple selections 
		var selSysIds = g_list.getChecked();
		var sysIdList = selSysIds.split(',');
		
		if (sysIdList.length == 1) {
			currentSysId = sysIdList[0];		
		} else if (sysIdList.length > 1) {
			alert("Only one alert may be selected while running Quick Response.");		
			return;
		} else {
			alert("An alert must be selected while running Quick Response.");		
			return;
		}
	}
	else {
		currentSysId = rowSysId;
	}
		
		
	var gr = new GlideRecord("em_alert");
	gr.addQuery('sys_id',currentSysId);
	gr.query();
	if (gr.next()){
		var alertNumber = gr.getValue('number');

		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		var dlg = new dialogClass('em_quick_response_popup');
		setPreference('alert_id',currentSysId);
		
		var message = new GwtMessage().getMessage('Quick Response for {0}', alertNumber); 
		CustomEvent.fireAll('alerts_sa.userActionOnTable');
		dlg.setTitle(message);
		dlg.setWidth(600);
		dlg.render();
	}
	else {
		alert("An alert must be selected while running Quick Response.");
	}
}
