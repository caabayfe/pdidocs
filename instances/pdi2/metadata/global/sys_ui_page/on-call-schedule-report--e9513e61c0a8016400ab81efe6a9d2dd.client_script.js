var BASE_ROTA_JOIN = "JOINsys_user_group.sys_id=cmn_rota.group!active";
var ROTA_JOIN = BASE_ROTA_JOIN + "=true";

// auto complete runs the search for name input
// populates the names select from the sys_user_group table

var ac;

function clearLeftSelect() {
	var leftOptions = slush.getLeftSelect().options.length;
	for (var i = 0; i < leftOptions; i++)
		slush.getLeftSelect().options[0].remove();
}

addLoadEvent(function() {
	$("search").on("keyup", debounce(getGroupList, 1000, false));
	slush.clear();
	slush.ignoreDuplicates = true;
	getGroupList();
});

function setOnCallStatus(status) {
	gel('status').innerHTML = status;
}

function getGroupList() {
	setOnCallStatus("Retrieving list of groups");
	var gr = new GlideRecord('sys_user_group');
	gr.addQuery(BASE_ROTA_JOIN, "=", "true");
	var userInputElem = gel("search");
	if (userInputElem && userInputElem.value && userInputElem.value.length > 0 && userInputElem.value !== '*') {
		clearLeftSelect();
		if (userInputElem.value.indexOf('*') === 0)
			gr.addQuery("name", "CONTAINS", userInputElem.value.substring(1));
		else
			gr.addQuery("name", "STARTSWITH", userInputElem.value);
	}
	var selectedSysIds = getSelectedIds();
	if (selectedSysIds.length > 0) {
		gr.addQuery("sys_id", "NOT IN", selectedSysIds.join(","));
	}
	gr.addOrderBy("name");
	gr.query(populateGroupList);
}

function getSelectedIds() {
	var selectedSysIds = slush.getValues(slush.getRightSelect());
	return selectedSysIds;
}

function getFilteredQuery(prefix) {
	var selectedSysIds = getSelectedIds();
	var suffix = "";
	if (selectedSysIds.length > 0)
		suffix = "^sys_idNOT IN" + selectedSysIds.join(",");
	return prefix + suffix; 
}

function populateGroupList(gr) {
	if (!gr)
		return;
	while (gr.next())
		slush.addLeftChoice(gr.sys_id, gr.name);
	setOnCallStatus('');
}

function isUserInputValid() {
	var result = true;
	// ensure start and end dates have valid date values
	// if not then prevent form submission and show an error message
	var dateFields = [ "start_date", "end_date" ];
	for (var i = 0; i < dateFields.length; i++) {
		var date = gel(dateFields[i]).value;
		var isValid = !date || (date && isDate(date, g_user_date_format));
		result = result && isValid;
		var dateErrorElem = $(dateFields[i] + "_invalid_msg");
		if (isValid)
			dateErrorElem.hide();
		else
			dateErrorElem.show();
	}

	if (result) {
		var dateFormat = g_user_date_format.toUpperCase();
		var startDate = moment(gel("start_date").value, dateFormat);
		var endDate = moment(gel("end_date").value, dateFormat);
		if (endDate.isBefore(startDate)) {
			result = false;
			$("end_date_invalid_msg").show();
		}
	}

	var selectedGroups = slush.getValues(slush.getRightSelect());
	var selectedGroupValid = true;
	var errMsg = "";

	if (selectedGroups.length < 1) {
		result = false;
		selectedGroupValid = false;
		errMsg = "${JS:gs.getMessage('Please select at least one group')}";
		$("slush_bucket_invalid_msg").innerHTML = errMsg;
		$("slush_bucket_invalid_msg").show();
	}

	if (selectedGroups.length > 199 && gel("report_style").value == "formatted") {
		result = false;
		selectedGroupValid = false;
		var numGroups = selectedGroups.length;
		errMsg = new GwtMessage().getMessage('You have chosen: {0} groups. Please select fewer than 200 groups or change report style to: Table.', numGroups);
		$("slush_bucket_invalid_msg").innerHTML = errMsg;
		$("slush_bucket_invalid_msg").show();
	}

	if (selectedGroupValid)
		$("slush_bucket_invalid_msg").hide();

	return result;
}

function debounce(func, wait, immediate) {
	var timeout, args, context, timestamp, result;
	var later = function() {
		var last = new Date().getTime() - timestamp;
		if (last < wait && last >= 0) {
			timeout = setTimeout(later, wait - last);
		} else {
			timeout = null;
			if (!immediate) {
				result = func.apply(context, args);
				if (!timeout)
					context = args = null;
			}
		}
	};
	return function() {
		context = this;
		args = arguments;
		timestamp = new Date().getTime();
		var callNow = immediate && !timeout;
		if (!timeout)
			timeout = setTimeout(later, wait);
		if (callNow) {
			result = func.apply(context, args);
			context = args = null;
		}
		return result;
	};
}

function runReportDoctype() {
	if (!isUserInputValid())
		return false;
	else
		runReport();
}

function runReport() {
	var style = gel('report_style');
	var array = slush.getValues(slush.getRightSelect());
	var e = gel('groups');
	e.value = array.join(',');
	var i18nMsg = getMessage("Generating report...");
	var status = '<span><i>' + i18nMsg + '</i></span>';
	setOnCallStatus(status);
}
