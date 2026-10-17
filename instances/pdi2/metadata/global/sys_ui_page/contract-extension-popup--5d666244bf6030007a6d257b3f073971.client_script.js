addLoadEvent(function() {
	var endElement = gel('end_date');
	endElement.onchange = checkEndDate;
})

function submitExtension() {
	if(!ApproverPicked()){
        alert (getMessage('Please choose a valid approver to review and approve this contract extension'));
    	return false;
	}	
	if(!checkEndDate())
		return false;
	
    var c = gel('hold_or_submit');
    c.value = "submit";
	return true;
}

function holdReview() {
    var c = gel('hold_or_submit');
    c.value = "hold";
    return true;
}

function cancelExtension() {
    var c = gel('hold_or_submit');
    c.value = "cancel";
    return true;
}
function ApproverPicked(){
	var a = document.getElementById("approver").value;
	if (a !='')
		return true;
}

function calcEndDate() {
    var yearInd = gel("extension_option").selectedIndex;
	var year = gel("extension_option").options[yearInd].value;
    var start = gel("start_date").value;
	var startDateObj = new Date(getDateFromFormat(start, g_user_date_format));
	var endValue = "";
    if(yearInd != 0 && start != "" ){
        var y = startDateObj.getFullYear();
        var endYear = parseInt(y)+parseInt(year);
		startDateObj.setFullYear(endYear);
        endValue = formatDate(startDateObj, g_user_date_format);
    }
    if(yearInd == 0 && start != "" ){
        endValue = start;
    }
	gel("end_date").value = endValue;
}

function costPercentAdjust() {
    if(document.getElementById("cost_percent").value != 0)
        document.getElementById("cost_adjust").value = 0;
}

function costAdjustPercent() {
    if(document.getElementById("cost_adjust").value != 0)
        document.getElementById("cost_percent").value = 0;
}

function checkEndDate(){
	var startDate = gel('start_date').value;
	var startTime = new Date(getDateFromFormat(startDate, g_user_date_format));
	var endDate = document.getElementById('end_date').value;
	var newTime = new Date(getDateFromFormat(endDate, g_user_date_format));
	var endErrorHandle = document.getElementById('endErrorMessage');
	var currentDate = new Date();
	
	if (newTime < currentDate){
		endErrorHandle.innerHTML="<img src='images/outputmsg_error.gifx' alt='Error Message'>${gs.getMessage('End date should be later than current time')}";
		endErrorHandle.style.backgroundColor="#FFEBE8";
        return false;
	}
	else if (newTime < startTime) {
		endErrorHandle.innerHTML="<img src='images/outputmsg_error.gifx' alt='Error Message'>${gs.getMessage('End date should be after the end of current active contract')}";
		endErrorHandle.style.backgroundColor="#FFEBE8";
        return false;
	}
		endErrorHandle.innerHTML="";
    return true;
}
