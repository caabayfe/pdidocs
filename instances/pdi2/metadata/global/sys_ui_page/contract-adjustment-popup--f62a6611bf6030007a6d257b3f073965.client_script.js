addLoadEvent(function() {
	var contractStarts = gel('contract_starts');
	contractStarts.onchange = checkStartDate;
	var contractEnds = gel('contract_ends');
	contractEnds.onchange = checkEndDate;
});

function actionOK() {
	var c = gel('cancel_or_submit');
    c.value = "submit";
	var e = gel('error');	
	if(e.value == "false")
		return true;
	else return false;
}

function cancel() {
	var c = gel('cancel_or_submit');
    c.value = "cancel";
	GlideDialogWindow.get().destroy();
	return false;
}

function checkStartDate() {
	var startDate = document.getElementById('contract_starts').value;
	var startTime = new Date(getDateFromFormat(startDate, g_user_date_format));
	var endDate = document.getElementById('contract_ends').value;
	var endTime = new Date(getDateFromFormat(endDate, g_user_date_format));
	var e = gel('error');
	
	if ( endTime < startTime && endDate != '') {
		var startErrorHandle = document.getElementById('startErrorMessage');
		startErrorHandle.style.backgroundColor="#FFEBE8";
		startErrorHandle.innerHTML="<img src='images/outputmsg_error.gifx' alt='Error Message'>${gs.getMessage('Start date can not be after the end date')}";
		e.value = "true";
	} else {
		document.getElementById('startErrorMessage').innerHTML="";
		if (e.value == "false") 
			document.getElementById('endErrorMessage').innerHTML="";
		e.value = "false";
	}
}

function checkEndDate() {
	var startDate = document.getElementById('contract_starts').getValue();
	var startTime = new Date(getDateFromFormat(startDate, g_user_date_format));
	var endDate = document.getElementById('contract_ends').getValue();
	var endTime = new Date(getDateFromFormat(endDate, g_user_date_format));
	var e = gel('error');
	var now = new Date();
	
	var endErrorMessageHandle = document.getElementById('endErrorMessage');
		
	if (endTime <  startTime && endDate != '') {
		endErrorMessageHandle.style.backgroundColor="#FFEBE8";
		endErrorMessageHandle.innerHTML="<img src='images/outputmsg_error.gifx' alt='Error Message'>${gs.getMessage('End date can not be before the start date')}";
		e.value = "true";
	} else {
		endErrorMessageHandle.innerHTML="";
		document.getElementById('startErrorMessage').innerHTML="";
		e.value = "false";
	}
	
	if (endTime <  now && endDate != '') {
		endErrorMessageHandle.innerHTML="<img src='images/outputmsg_error.gifx' alt='Error Message'>${gs.getMessage('End date must be later than current time')}";
		endErrorMessageHandle.style.backgroundColor="#FFEBE8";
		e.value = "true";
	}
}
