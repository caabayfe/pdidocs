addLoadEvent(function() {
	var starElement = gel('start_date');
	starElement.onchange = function(){
		calcEndDate();
		checkStartDate();
	};
	var endElement = gel('end_date');
	endElement.onchange = function(){
		checkEndDate();
	};
});

function submitReview() {
    if(!ApproverPicked()){
        alert (getMessage('Please choose a valid approver to review and approve your renewal contract'));
        return false;
    }
    var c = gel('hold_or_submit');
    c.value = "submit";
	checkEndDate();
    var startError = gel('start_error');
	var endError = gel('end_error');
	
	if(startError.value == "false" && endError.value == "false")
		return true;
	else return false;
}

function holdReview() {
    var c = gel('hold_or_submit');
    c.value = "hold";
    var startError = gel('start_error');
	var endError = gel('end_error');

	if(startError.value == "false" && endError.value == "false")
		return true;
	else return false;
}

function cancelReview() {
    var c = gel('hold_or_submit');
    c.value = "cancel";
	GlideDialogWindow.get().destroy();
	return false;
}

function ApproverPicked(){
    var a = document.getElementById("sys_display.approver").value;
    if (a !='')
        return true;
}

function calcEndDate() {
    var yearInd = document.getElementById("renew_option").selectedIndex;
	var year = gel("renew_option").options[yearInd].value;
    var start = gel("start_date").value;
	var startDateObj = new Date(getDateFromFormat(start, g_user_date_format));
    var endValue = "";
    if(yearInd != 0 && start != "" ){
		var y = startDateObj.getFullYear();
		var endYear = parseInt(y)+parseInt(year);
        startDateObj.setFullYear(endYear);
		startDateObj.setDate(startDateObj.getDate()-1);
		endValue = formatDate(startDateObj, g_user_date_format);
		gel("end_date").value = endValue;
    }
}

function costPercentAdjust() {
    if(document.getElementById("cost_percent").value != 0)
        document.getElementById("cost_adjust").value = 0 ;
}

function costAdjustPercent() {
    if(document.getElementById("cost_adjust").value != 0)
        document.getElementById("cost_percent").value = 0;
}

function checkStartDate() {
	var starts = gel('contract_starts').value;
	var contractStarts = new Date(getDateFromFormat(starts, g_user_date_format));
	var startDate = gel('start_date').value;
	var startTime = new Date(getDateFromFormat(startDate, g_user_date_format));
	var endDate = gel('end_date').value;
	var endTime = new Date(getDateFromFormat(endDate, g_user_date_format));
	var startError = gel('start_error');
	var endError = gel('end_error');
	var startErrorMSGHandle = gel('startErrorMessage');

	if (endTime < startTime && endDate != '') {
		startErrorMSGHandle.innerHTML="<img src='images/outputmsg_error.gifx' alt='Error Message'>${gs.getMessage('Start date cannot be after the end date')}";
		startError.value = "true";
		return;
	}

	if(contractStarts > startTime) {
		startErrorMSGHandle.innerHTML="<img src='images/outputmsg_error.gifx' alt='Error Message'>${gs.getMessage('Please specify a Renewal start date after the contract start date')}";
		startError.value = "true";
	} else {
		startErrorMSGHandle.innerHTML="";
		startError.value = "false";

		if (endError.value == "true")
			checkEndDate();
	}
}

function checkEndDate() {
	var startDate = gel('start_date').value;
	var startTime = new Date(getDateFromFormat(startDate, g_user_date_format));
	var endDate = gel('end_date').value;
	var newTime = new Date(getDateFromFormat(endDate, g_user_date_format));
	var endError = gel('end_error');
	var startError = gel('start_error');
	var endErrorMSGHandle = document.getElementById('endErrorMessage');
	var currentTime = new Date();
	
	if (newTime < startTime && endDate != '') {
		endErrorMSGHandle.innerHTML="<img src='images/outputmsg_error.gifx' alt='Error Message'>${gs.getMessage('End date cannot be before the start date')}";
		endError.value = "true";
	} else if (newTime < currentTime && endDate!='') {
		endErrorMSGHandle.innerHTML="<img src='images/outputmsg_error.gifx' alt='Error Message'>${gs.getMessage('End date cannot be before the current date')}";
		endError.value = "true";
	} else {
		endErrorMSGHandle.innerHTML="";
		endError.value = "false";

		if(startError.value == "true")
			checkStartDate();
	}
}
