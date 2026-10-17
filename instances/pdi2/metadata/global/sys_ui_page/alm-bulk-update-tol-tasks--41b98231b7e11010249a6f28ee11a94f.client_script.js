var lineItems = {};
(function initialLoad() {
	jQuery("#form_div,#receive_msg_div,#tol_above_100_msg_div").hide();
})();

// loads TOLines for the selected stage in the slush bucket, shows corresponding fields and Update button
function loadLineItems(lineItemStage) {
	var dlg = GlideDialogWindow.get();
	var sysId = dlg.getPreference("sysId");
	jQuery("#form_div").show();
	clearFieldValues();
	// Default 'Assigned to' to logged in user
	gel('assigned_to').value = g_user.userID;
	gel('sys_display.assigned_to').value = g_user.userName;
	if (lineItemStage === "in_transit") {
		jQuery("#in_transit_div").show();
	} else {
		jQuery("#in_transit_div").hide();
	}
	if (lineItemStage === "received") {
		jQuery("#receive_msg_div").show();
	} else {
		jQuery("#receive_msg_div").hide();
	}
	//Hide tol_details on loading a different stage.
	jQuery("#tol_details").hide();
	// clear the slush bucket
	slush.clear();
	slush.ignoreDuplicates = true;
	// AJAX call to get TO line items in the selected stage
	var ga = new GlideAjax('TransferOrderLineBulkUpdateAjax');
	ga.addParam('sysparm_name', 'getLineItems');
	ga.addParam('sysparm_id', sysId);
	ga.addParam('sysparm_stage', lineItemStage);
	// Ajax response callback function
	ga.getXML(loadResponse);
}
// Clear field values when stage selection is changed
function clearFieldValues() {
	gel('tracking_number').value = '';
	gel('ship_date').value = '';
	gel('vendor').value = '';
	gel('sys_display.vendor').value = '';
}
// Pushes queried TOLs to the Available section of slush bucket
function loadResponse(response) {
	// Process the return XML document and add line items to the left of slush
	var items = response.responseXML.getElementsByTagName("lineItemsHash");
	lineItems = JSON.parse(items[0].getAttribute("lineItemsHash"));
	for (var line in lineItems) {
		slush.addLeftChoice(line, lineItems[line].number + " - " + lineItems[line].asset);
	}
	// Upon click on TOL in Available section, show TOL details
	jQuery("#slush_left").click(function() {
		if (event.target.tagName === 'OPTION') {
			showTOLMetaData(lineItems[event.target.value]);
		}
	});
	var selectedLineItems;
	// When double click, hide asset details
	jQuery("#slush_left option").dblclick(function() {
		jQuery("#tol_details").hide();
	});
	// When arrow in slush busket is clicked, hide asset details
	jQuery("#addRemoveButtons a").click(function() {
		jQuery("#tol_details").hide();
	});
}
function showTOLMetaData(metaData) {
	var translatedMsg = getMessage('Model: ');
	jQuery("#model").html('<strong>' + translatedMsg + '</strong>');
	jQuery("#model").append(document.createTextNode(metaData['model']));
	translatedMsg = getMessage('Asset: ');
	jQuery("#asset").html('<strong>' + translatedMsg + '</strong>');
	jQuery("#asset").append(document.createTextNode(metaData['asset']));
	if(metaData['model_class'] == 'cmdb_consumable_product_model'
		|| metaData['asset_tracking_strategy'] == 'track_as_consumable') {
		translatedMsg = getMessage('Quantity requested: ');
		jQuery("#qty_req").html('<strong>' + translatedMsg + '</strong>');
		jQuery("#qty_req").append(document.createTextNode(metaData['qty_req']));
		translatedMsg = getMessage('Quantity received: ');
		jQuery("#qty_rec").html('<strong>' + translatedMsg + '</strong>');
		jQuery("#qty_rec").append(document.createTextNode(metaData['qty_rec']));
		jQuery("#qty_details").show();
	} else {
		jQuery("#qty_details").hide();
	}
	jQuery("#tol_details").show();
}
// Updates and closes the tasks of selected TOLs
function updateAndClose() {
	var selectedLineItems = slush.getValues(slush.getRightSelect());
	var selectedItemsCount = selectedLineItems.length;
	gel('selectedLinesCount').value = selectedItemsCount;
	if (selectedItemsCount > 0) {
		if (selectedItemsCount > parseInt(gel('maxLinesCount').value)) {
			jQuery("#tol_above_100_msg_div").show();
		}
		gel('selectedLines').value = selectedLineItems.join(",");
		var dlg = GlideDialogWindow.get();
		gel('transfer_order').value = dlg.getPreference("sysId");
		return true;
	} else {
		// throw error message
		jQuery("#error-message-container").show().delay(3000).fadeOut();
		return false;
	}
}
