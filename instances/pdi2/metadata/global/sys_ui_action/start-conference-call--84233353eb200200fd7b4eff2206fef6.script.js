function openPopUpConferenceDialog(){
	var notifyOnTask = new NotifyOnTaskClient(g_form.getTableName(), g_form.getUniqueValue());
		notifyOnTask.setNumber(g_form.getValue("number"));
		notifyOnTask.setSubmitCallback(conferenceOnSubmitCallback);
		notifyOnTask.setSuccessCallback(conferenceOnSuccessCallback);
		notifyOnTask.setCancelCallback(conferenceCancelCallback);
		notifyOnTask.setErrorCallback(conferenceOnSuccessCallback);
		var confData = NotifyOnTaskClient.getNotifyActionTemplate();
		confData.addToWorkNotes = true;
		confData.allowMulticonference = true;
		notifyOnTask.openConferenceDialog(confData);
}

function conferenceOnSuccessCallback(notifyParameters, formObj, formParameters, data){
	g_form.clearMessages();

	for(var i=0; data.successMessages.length > i; i++){
		g_form.addInfoMessage(data.successMessages[i]);
	}

	for(i=0; data.errorMessages.length > i; i++){
		g_form.addErrorMessage(data.errorMessages[i]);
	}
}

function conferenceOnSubmitCallback(notifyParameters, formObj, formParameters){
	g_form.clearMessages();
	g_form.addInfoMessage(getMessage("Your conference call is being started..."));
}

function conferenceCancelCallback(notifyParameters){
}
