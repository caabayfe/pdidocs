function assignSMAdminRole() {
	var user_values = user_sb.getValues(user_sb.getRightSelect());
	var ajax_left_select = new GlideAjax('global.SMRoleAdministration');
	ajax_left_select.addParam('sysparm_name', 'assignSMAdminRole');
	ajax_left_select.addParam('sysparm_user_sys_ids', user_values);
	ajax_left_select.getXMLAnswer(loadResponseIntoLeftSelect);

	// Clear selections
	unselectOptions(user_sb.getRightSelect());
	unselectOptions(user_sb.getLeftSelect());
}

function refreshPage() {
	window.location.reload();
}

// Called when the UI page loads
addLoadEvent(function(){
	//Load the users when the UI page loads
	user_sb.clear();

	//Fetch left options first
	var ajax_left_select = new GlideAjax('global.SMRoleAdministration');
	ajax_left_select.addParam('sysparm_name', 'getAvailableUsers');
	ajax_left_select.getXMLAnswer(function (result1) {
		//Then fetch what needs to be moved to right select
		var ajax_right_select = new GlideAjax('global.SMRoleAdministration');
		ajax_right_select.addParam('sysparm_name', 'getSMAdminUserSysIds');
		ajax_right_select.getXMLAnswer(function (result2) {
			loadResponseIntoLeftSelect(result1);
			moveOptionsIntoRightSelect(result2);
		});
	});

	return false;
});

// Called when we get a response from the 'addLoadEvent' function -> getAvailableUsers
function loadResponseIntoLeftSelect(result) {
	var user_array = JSON.parse(result);
	if (user_array == null || user_array == undefined)
		return;

	var user_array_length = user_array.length;
	// Loop through item elements and add each item to left slushbucket
	for(var i = 0; i < user_array_length; i++) {
		var user = user_array[i];
		user_sb.addLeftChoice(user.sys_id, user.name);
	}
}

// Called when we get a response from the 'addLoadEvent' function -> getSMAdminUserSysIds
function moveOptionsIntoRightSelect(result) {
	if (result == null)
		return;

	var user_array = JSON.parse(result);
	var right_select = user_sb.getRightSelect();
	var left_select = user_sb.getLeftSelect();
	var left_options = left_select.options;
	var left_options_length = left_options.length;

	// Loops through left slushbucket user options
	// Marks user options in left slushbucket as selected if they have SM admin role assigned (persisted)
	for (var i = 0; i < left_options_length; i++) {
		var left_option = left_options[i];
		if (user_array.indexOf(left_option.value.toString()) !== -1)
			left_option.selected = true;
	}

	// Move the selected options from left to right
	try {
		user_sb.moveOptions(left_select, right_select, false);
	} catch (e) { // This exception is caused as our UI code asks for a form but, we are rendering a UI page in the frame
		// Once the items are moved to right slushbucket unselect them
		unselectOptions(user_sb.getRightSelect());
	}
}

// Un-select options in the selected bucket
function unselectOptions(select) {
	var options = select.options;
	var options_length = options.length;
	for (var i = 0; i < options_length; i++) {
		var option = options[i];
		option.selected = false;
	}
}
