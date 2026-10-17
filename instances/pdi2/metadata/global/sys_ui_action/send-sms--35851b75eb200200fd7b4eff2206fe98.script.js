function openPopUpSMS(){
	var notifyOnTask = new NotifyOnTaskClient(g_form.getTableName(), g_form.getUniqueValue());
		notifyOnTask.setNumber(g_form.getValue("number"));
		notifyOnTask.setSubmitCallback(smsOnSubmitCallback);
		notifyOnTask.setSuccessCallback(smsOnSuccessCallback);
		notifyOnTask.setCancelCallback(smsCancelCallback);
		notifyOnTask.setErrorCallback(function(){});
		var smsData = NotifyOnTaskClient.getNotifyActionTemplate();
		smsData.addToWorkNotes = true;
		smsData.table = g_form.getTableName();
		smsData.sysId = g_form.getUniqueValue();
		notifyOnTask.openSmsDialog(smsData);
}

function smsOnSuccessCallback(notifyParameters, formObj, formParameters, data){
	g_form.clearMessages();
	var obj = null;
	if(typeof data == 'string')
		obj = $j.parseJSON(data);
	else if(typeof data == 'object')
		obj = data;
	for(var i=0; obj.successMessages.length > i; i++){
		g_form.addInfoMessage(obj.successMessages[i]);
	}
	for(var j=0; obj.errorMessages.length > j; j++){
		g_form.addErrorMessage(obj.errorMessages[j]);
	}
}

function smsOnSubmitCallback(notifyParameters, formObj, formParameters){	
	notifyParameters.dlgWindow.destroy();
}

function smsCancelCallback(notifyParameters){
	notifyParameters.dlgWindow.destroy();
}
