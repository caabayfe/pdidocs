//# sourceURL=groupRostersInlineScript.js

function rosterPageInit() {
	schedulePage.calendar.setWrap(false);
	var e = gel("group_id");
	if (e)
		schedulePage.group = e.value;
	schedulePage.registerOnAdd(rosterPageOnAdd);
	schedulePage.registerOnDblClickHandler(rosterPageOnDblClick);
	schedulePage.calendar.setDNDEnabled(false);
	// select the group from the list
	// first item is selected by default, so no onChange is called - do it manually
    if (!schedulePage.group || selectMenuItem(schedulePage.group, "group_list") === 0)
		groupChange();
}

function groupChange() {
	var e = gel("group_list");
	if (e.selectedIndex > -1) {
	    var id = e.options[e.selectedIndex].value;
	    schedulePage.group = id;
	    schedulePage.calendar.group = id;
	    schedulePage.addParam("group", id);
	} else {
		//hide the group dropdown and its label in case there is no group associated with the user
		e.style.display = "none";
		e = gel("label_group_list");
		e.style.display = "none";
		//explain why user can't see the group dropdown
		var u_g_form = new GlideForm('',true,true,true,true);
	    u_g_form.addInfoMessage("You are not in any group");
	}
	schedulePage.run();
}

// User has clicked a cell or selected a range of cells
function rosterPageOnAdd(fromDate, toDate) {
	if((toDate.getMinute() == 0) && (toDate.getSecond() == 0))
		toDate.addSeconds(-1);

	var dialog = new GlideDialogForm('Add Item', 'ui_page');
	dialog.setFieldID(schedulePage.DIALOG_TARGET_FIELD);
	dialog.addParm('name', 'on_call_add_item');
	// Add in any additional parameters
	dialog.addParm('sysparm_group', schedulePage.group);
	dialog.addParm('sysparm_start', fromDate.serializeInUserFormat());
	dialog.addParm('sysparm_end', toDate.serializeInUserFormat());
	dialog.addParm('sysparm_target_field', schedulePage.DIALOG_TARGET_FIELD);
	dialog.addParm('set_request_params', 'true');
	dialog.render();
}

function reloadCallback() {
    // Force reloading the calendar
    groupChange();
}

function rosterPageOnDblClick(itemWindow, ev) {
	var tableName = itemWindow.item.getTableName();
	var isReadOnlyUser = true;
	var e = gel("is_read_only_user");
	if (e)
		isReadOnlyUser = e.value === "true";
	if (tableName && (isReadOnlyUser || tableName != "cmn_rota_member"))
        schedulePage.calendar.getCurrentView().editItem(itemWindow.item, moment(itemWindow.start).format("YYYYMMDD"), reloadCallback);
	else if (!isReadOnlyUser)
		rosterPageOnAdd(itemWindow.start, itemWindow.end);
	else
		return;
}
