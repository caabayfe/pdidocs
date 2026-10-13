var BASE_ROTA_JOIN = "JOINsys_user_group.sys_id=cmn_rota.group!active";
var ROTA_JOIN = BASE_ROTA_JOIN + "=true";

// auto complete runs the search for name input
// populates the names select from the sys_user_group table
var showTypeChangeFlag;

var ac;

function clearLeftSelect() {
	var leftOptions = slush.getLeftSelect().options.length;
	for (var i = 0; i < leftOptions; i++)
		slush.getLeftSelect().options[0].remove();
}

addLoadEvent(function() {
	$("search").on("keyup", debounce(getGroupList, 1000, false));
	showTypeChangeFlag = false;
	setChangeHandler();
	slush.ignoreDuplicates = true;
	slush.clear();
	getGroupList();
});

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
	if (selectedSysIds.length > 0)
		gr.addQuery("sys_id", "NOT IN", selectedSysIds.join(","));
	gr.addOrderBy("name");
	gr.query(populateGroupList);
}

function setOnCallStatus(status) {
	gel('on_call_status').innerHTML = status;
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
	
function saveGroups() {
	var array = slush.getValues(slush.getRightSelect());
	var e = gel('groups');
	e.value = array.join(',');
	var i18nMsg = getMessage("Generating report...");
	var status = '<span><i>' + i18nMsg + '</i></span>';
	setOnCallStatus(status);
}

function setChangeHandler() {
	var select = slush.getRightSelect();
	select.onchange = setShowType;
}

function showTypeChanged() {
	showTypeChangeFlag = true;
}

function setShowType() {
	if (showTypeChangeFlag)
		return true;
	
	// If one group selected, set to roster, else set to on call person
	var select = gel('show_type_on_call_person');
	var array = slush.getValues(slush.getRightSelect());
	if (array.length <= 1)
		select.selectedIndex = 0;
	else
		select.selectedIndex = 1;
}

function validate() {
	var startDate = gel("start_date").value;
	if (startDate && !isDate(startDate, g_user_date_time_format)) {
		$("start_date_invalid_msg").show();
		return false;
	}
	return true;
}

function reportSubmitDoctype(elem) {
	var res = validate();
	if (!res)
		return false;
	return reportSubmit(elem);
}

function reportSubmit(elem) {
	saveGroups();
	return gsftSubmit(elem);
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
