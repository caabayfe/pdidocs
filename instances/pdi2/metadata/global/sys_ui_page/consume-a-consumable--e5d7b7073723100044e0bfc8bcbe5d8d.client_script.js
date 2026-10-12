function cancel() {
	var c = gel('cancelled');
	c.value = "true";

	// Only destroy the window when user is on platform view
	if (!isActionFromWorkspace())
		GlideDialogWindow.get().destroy();
}

function actionOK() {
	var total_quantity = gel('total_qty').value;
	var quantity = gel('qty').value;
	var asset_id = gel('alm_hardware').value;
	var user_id = gel('sys_user').value;
	isActionFromWorkspace();
	
	quantity = quantity.replaceAll(',', '');
	var regex = /^\d+$/;
	if (!regex.test(quantity) || isNaN(quantity)) {
		alert(getMessage("Please enter a non-zero number for quantity"));
		return false;
	}

	total_quantity = parseInt(total_quantity, 10);
	quantity = parseInt(quantity, 10);

	if (quantity > total_quantity) {
		alert(getMessage("Please enter a number less than or equal to the number in stock"));
		return false;
	} else if (quantity < 1) {
		alert(getMessage("Please enter a non-zero number for the quantity"));
		return false;
	} else if (asset_id == '' && user_id == '') {
		alert(getMessage("Please select an asset or a user to attach the consumed items to"));
		return false;
	} else {
		var form = document.forms['form.' + '${sys_id}'];
		addInput(form, "HIDDEN", "asset", asset_id);
		addInput(form, "HIDDEN", "user", user_id);
		return true;
	}
}

/**
 * Determine if the action performed was from platform or on workspace
 */
function isActionFromWorkspace() {
	var fromWorkspace = getParmVal('from_workspace') === "true";
	
	// Set the hidden input field that determined whether or not the
	// submission was from platform or workspace
	var c = gel('from_workspace');

	if (fromWorkspace)
		c.value = "true";
	else
		c.value = "false";
	
	return fromWorkspace;
}

/**
 * Helper function to get the parameter values from the URL
 *
 * @param {string} name of the url parameter to fetch
 */
function getParmVal(name) {
	var url = document.URL.parseQuery();
	if (url[name]) {
		return decodeURI(url[name]);
	}
	return;
}
