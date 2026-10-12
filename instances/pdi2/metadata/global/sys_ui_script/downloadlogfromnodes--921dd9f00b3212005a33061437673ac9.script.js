function setDownloadButton(e) {
	var downloadButton = gel("downloadButton");
	var selectedSysIdsElement = gel("selected_sys_ids");
	var selectedSysIds = [];
	var selectedString = selectedSysIdsElement.value;
	if (selectedString)
		selectedSysIds = selectedString.split(";");

	var thisId = e.name;
	if (e.checked) {
		downloadButton.removeAttribute('disabled');
		selectedSysIds.push(thisId);
	} else {
		var index = selectedSysIds.indexOf(thisId);
		selectedSysIds.splice(index, 1);

		var inputs = document.getElementsByTagName("input");
		var nonechecked = true;
		var i = 0;
		while (i < inputs.length && nonechecked) {
			if (inputs[i].type === "checkbox" && inputs[i].checked)
				nonechecked = false;

			i++;
		}
		if (nonechecked)
			downloadButton.setAttribute('disabled', 'true');

	}
	selectedSysIds = selectedSysIds.join(";");
	selectedSysIdsElement.value = selectedSysIds;
}

function selectAll(master) {
	var downloadButton = gel("downloadButton");
	var checkboxes = document.getElementsByClassName("systemID");
	var selectedSysIdsElement = gel("selected_sys_ids");
	var selectedArray = [];
	for (var i = 0; i < checkboxes.length; i++) {
		document.getElementById(checkboxes[i].id).checked = master.checked;
		selectedArray.push(checkboxes[i].value);
	}
	if (master.checked) {
		selectedSysIdsElement.value=selectedArray.join(';');
		downloadButton.removeAttribute('disabled');
	} else {
		selectedSysIdsElement.value="";
		downloadButton.setAttribute('disabled', 'true');
	}
}

function selectDateRange() {
	var dateRangeTab = gel("dateRangeTab");
	dateRangeTab.setAttribute('class', 'active');
	var oneDayTab = gel("oneDayTab");
	oneDayTab.setAttribute('class', 'deactive');
	var dateRangeTable = gel("dateRangeTable");
	dateRangeTable.setAttribute('class', 'show');
	var oneDayTable = gel("oneDayTable");
	oneDayTable.setAttribute('class', 'hidden');
}

function selectOneDay() {
	var dateRangeTab = gel("dateRangeTab");
	dateRangeTab.setAttribute('class', 'deactive');
	var oneDayTab = gel("oneDayTab");
	oneDayTab.setAttribute('class', 'active');
	var dateRangeTable = gel("dateRangeTable");
	dateRangeTable.setAttribute('class', 'hidden');
	var oneDayTable = gel("oneDayTable");
	oneDayTable.setAttribute('class', 'show');
}

function checkStartDate() {
	_checkDates('startDate');
}

function checkEndDate() {
	_checkDates('endDate');
}

function _checkDates(dateField) {
	if (!dateField || !['startDate', 'endDate'].includes(dateField)) {
		console.error('Invalid _checkDates argument dateField: ' + dateField);
		return;
	}

	var noLaterThanToday = 'Please select a date no later than today';
	var currentDate = new Date();
	var datesInSystemFormat = convertDatesToSystemFormat(gel('startDate').value, gel('endDate').value);
	var startDate = new Date(datesInSystemFormat[0] + 'T00:00');
	var endDate = new Date(datesInSystemFormat[1] + 'T00:00');
	var dateRange = gel('date_range').value;

	if (dateField == 'startDate') {
		if (endDate < startDate)
			gel('endDate').value = gel('startDate').value;

		if (currentDate < startDate) {
			alert(new GwtMessage().getMessage(noLaterThanToday));
			gel('startDate').value = new Date().toJSON().slice(0,10);
			gel('endDate').value = new Date().toJSON().slice(0,10);
		}
	} else {
		if (endDate < startDate) {
			alert(new GwtMessage().getMessage("Please select a date after start date"));
			gel('endDate').value = gel('startDate').value;
		}

		if (currentDate < endDate) {
			alert(new GwtMessage().getMessage(noLaterThanToday));
			gel('endDate').value = gel('startDate').value;
		}
	}

	if (OutOfDateRange(endDate, startDate, dateRange)) {
		alert(new GwtMessage().getMessage("Please select a date within {0} days", dateRange));
		gel('endDate').value = gel('startDate').value;
	}

	gel('date').value=gel(dateField).value;
}

function checkDate() {
	var currentDate = new Date();
	var dateInSystemFormat = convertDatesToSystemFormat(gel('date').value);
	var date = new Date(dateInSystemFormat[0]);
	var singleDate = gel('single_date').value;
	if (OutOfDateRange(currentDate, date, singleDate)) {
		alert(new GwtMessage().getMessage("Please select a date within {0} days", singleDate));
		gel('date').value = new Date().toJSON().slice(0,10);
	}
	if (currentDate < date) {
		alert(new GwtMessage().getMessage("Please select a date no later than today"));
		gel('date').value = new Date().toJSON().slice(0,10);
	}
	gel('startDate').value=gel('date').value;
	gel('endDate').value=gel('date').value;
}

//check whether the select date is within the date range that defined in GlideProperty
function OutOfDateRange(currentDate, date, dateRange) {
	return currentDate - date > (dateRange * 24 * 60 * 60 * 1000);
}

function scheduleCreation() {
	var select = getNotification();
	if (select === 'email') {
		var email = gel('emailAddress').value;
		if (!email) {
			alert(new GwtMessage().getMessage("Please specify an email address"));
			return false;
		}
	} else
		gel('emailAddress').value = '';

	if (downloadingInProcess())
		alert(new GwtMessage().getMessage("Another similar download is already in progress, please try later."));
	else
		schedule();

	return false;
}

function getNotification() {
	var notification = document.getElementsByName('notify');
	for (var i=0; i < notification.length; i++)
		if (notification[i].checked)
			return notification[i].value;

}

function downloadingInProcess() {
	var gr = new GlideRecord('sys_execution_tracker');
	gr.addQuery('name', 'Uploading Logs from Selected Nodes');
	gr.orderByDesc('sys_created_on');
	gr.setLimit(1);
	gr.query();
	if (!gr.next())
		return false;

	return gr.getValue('state') === '1';
}

function schedule() {
	var ga = new GlideAjax('ScheduleNodesLogsDownload');
	ga.addParam('sysparm_name','schedule');
	ga.addParam('sysparm_selected_sys_ids', getSelectedNode());
	ga.addParam('sysparm_email', gel('emailAddress').value);
	ga.addParam('sysparm_protocol', window.location.protocol);
	ga.addParam('sysparm_host', window.location.host);

	var dateRange = getDateRange(gel('startDate').value, gel('endDate').value);
	ga.addParam('sysparm_date_range', dateRange);

	if (gel('emailAddress').value === '')
		ga.getXML(redirect);

	else {
		ga.getXML();
		alert(new GwtMessage().getMessage(formatMessage('An email will be sent to {0} upon completion.', gel('emailAddress').value)));
		GlideModal.get().destroy();
	}
}

function getDateRange(startDate, endDate){
	var datesInSystemFormat = convertDatesToSystemFormat(startDate, endDate);
	startDate = datesInSystemFormat[0];
	endDate = datesInSystemFormat[1];
	var dateArray = [];
	var currentDate = startDate;
	while (currentDate <= endDate) {
		dateArray.push(currentDate);
		var oneDayAfter = new Date(new Date(currentDate).getTime() + 24*60*60*1000);
		currentDate = oneDayAfter.toJSON().slice(0,10);
	}
	return dateArray.join(';');
}

function convertDatesToSystemFormat(startDate, endDate) {
	var todayDate = new Date().toJSON().slice(0,10);
	var datesArray = [];
	// If startDate or endDate is today's date then there is no need to convert them into system's format.
	if(startDate == todayDate && endDate == null){
		datesArray.push(startDate);
		return datesArray;
	}
	else if (startDate != todayDate && endDate == null){
		var res = makeAjaxCallToConvertDates(startDate);
		datesArray.push(res.start_date);
		return datesArray;
	}
	else if (startDate == todayDate && endDate == todayDate){
		datesArray.push(startDate);
		datesArray.push(endDate);
		return datesArray;
	}
	else if (startDate != todayDate && endDate == todayDate){
		var res = makeAjaxCallToConvertDates(startDate);
		datesArray.push(res.start_date);
		datesArray.push(endDate);
		return datesArray;
	}
	else if (startDate != null && endDate != null){
		var res = makeAjaxCallToConvertDates(startDate, endDate);
		datesArray.push(res.start_date);
		datesArray.push(res.end_date);
		return datesArray;
	}
}

function makeAjaxCallToConvertDates(startDate, endDate){
	var ga = new GlideAjax('DownloadLogFromNodesUtil');
	ga.addParam('sysparm_name', 'convertDatesToSystemFormat');
	ga.addParam('sysparm_start_date', startDate);
	ga.addParam('sysparm_end_date', endDate);
	ga.getXMLWait();
	return JSON.parse(ga.getAnswer());
}

function redirect(response) {
	var tableSysID = response.responseXML.documentElement.getAttribute("answer");
	if (tableSysID === undefined)
		return;

	window.location.href = window.location.protocol + "//" + window.location.host + '/node_log_download_info.do?sys_id=' + tableSysID;
}
