function addLoadEvent() {
	document.getElementById("cancel_button").style.display = "none";
	getEnabledCheckboxStatus();
}

function getEnabledCheckboxStatus() {
	var ga = new GlideAjax('getFeatureAccessEnabledStatus');
	ga.addParam('sysparm_name', 'getCheckboxStatus');
	ga.getXML(checkBoxStatusResponse);
}

function checkBoxStatusResponse(response) {
	var responseXML = response.responseXML;
	if (responseXML && responseXML.documentElement && responseXML.documentElement.getAttribute("answer"))
		// if response allUISectionsActive is active, then feature access filtering is not in use
		if (responseXML.documentElement.getAttribute("answer") === "false")
			document.getElementById("ni.enableFiltering").checked = true;
		else
			document.getElementById("ni.enableFiltering").checked = false;		
}

function submitForm(){
	var glideListsToClose = document.querySelectorAll('[id*="_lock"]');
	//close all the glide lists to save the values
	for (var i = 0; i < glideListsToClose.length; i++){
			glideListsToClose[i].click();
	}
	
	var glideLists = document.querySelectorAll('[id*="_nonedit"]');
	// Uses GlideAJAX to save the form so UI page doesn't freeze on Save click
	asyncSaveFeatures(glideLists);
}

function myCallBack(response) {
    var responseXML = response.responseXML;
	if (responseXML && responseXML.documentElement && responseXML.documentElement.getAttribute("answer"))
		alert(getMessage("List saved successfully"));
	else
		alert(getMessage("Error saving feature list, please try again"));
}

function asyncSaveFeatures(glideLists) {
	var elemArray = [];
	for (var i = 0; i < glideLists.length; i++) {
		elemArray.push({
			id: glideLists[i].id,
			innerHTML: glideLists[i].innerHTML
		});
	}
	var elemArrayToString = JSON.stringify(elemArray);
	var featureAccessEnabled = document.getElementById("ni.enableFiltering").checked;
	var ga = new GlideAjax('saveFlowDesignerFeatures');
	ga.addParam('sysparm_name', 'saveFeatures');
	ga.addParam('sysparm_glideLists', elemArrayToString); //Parm1
	ga.addParam('sysparm_featureAccessEnabled', featureAccessEnabled); //Parm2
	ga.getXML(myCallBack);
}

// Panel collapse/expand
function togglePanel(panelId) {
	var body = document.getElementById(panelId);
	var icon = document.getElementById(panelId + 'Icon');
	if (body.style.display === 'none') {
		body.style.display = '';
		icon.textContent = '\u25BE';
	} else {
		body.style.display = 'none';
		icon.textContent = '\u25B8';
	}
}

// Checkbox management
function toggleSelectAll(masterCb, section) {
	var boxes = document.querySelectorAll('.' + section + '-cb');
	for (var i = 0; i < boxes.length; i++) {
		boxes[i].checked = masterCb.checked;
	}
	updateBulkBar();
}

function updateBulkBar() {
	var checked = document.querySelectorAll('.feature-cb:checked');
	var bar = document.getElementById('bulkActionBar');
	var countEl = document.getElementById('selectedCount');
	if (checked.length > 0) {
		bar.style.display = 'flex';
		countEl.textContent = checked.length + ' selected';
	} else {
		bar.style.display = 'none';
	}
}

function getSelectedNames() {
	var checked = document.querySelectorAll('.feature-cb:checked');
	var names = [];
	for (var i = 0; i < checked.length; i++) {
		names.push(checked[i].getAttribute('data-name'));
	}
	return names;
}

// Bulk role picker: read selected role data from the lightweight_glide_list2 macro
function getBulkRoleData() {
	// Lock the bulk picker to commit any pending edits
	var lockBtn = document.querySelector('[id*="bulkRoleSelector"][id*="_lock"]');
	if (lockBtn) lockBtn.click();

	var nonedit = document.querySelector('[id*="bulkRoleSelector"][id*="_nonedit"]');
	var roleData = nonedit ? nonedit.innerHTML.trim() : "";

	// Unlock it again so the user can continue editing
	if (lockBtn) lockBtn.click();

	return roleData;
}

// Bulk operations
function bulkAddRole() {
	var roleData = getBulkRoleData();
	if (!roleData) { alert(getMessage('Please select at least one role.')); return; }
	var names = getSelectedNames();
	if (names.length === 0) return;
	if (!confirm(new GwtMessage().getMessage('Add selected role(s) to {0} feature(s)? The page will reload after saving.', names.length))) return;

	var ga = new GlideAjax('saveFlowDesignerFeatures');
	ga.addParam('sysparm_name', 'bulkAddRole');
	ga.addParam('sysparm_elementNames', JSON.stringify(names));
	ga.addParam('sysparm_roleData', roleData);
	ga.getXML(bulkCallback);
}

function bulkRemoveRole() {
	var roleData = getBulkRoleData();
	if (!roleData) { alert(getMessage('Please select at least one role.')); return; }
	var names = getSelectedNames();
	if (names.length === 0) return;
	if (!confirm(new GwtMessage().getMessage('Remove selected role(s) from {0} feature(s)? The page will reload after saving.', names.length))) return;

	var ga = new GlideAjax('saveFlowDesignerFeatures');
	ga.addParam('sysparm_name', 'bulkRemoveRole');
	ga.addParam('sysparm_elementNames', JSON.stringify(names));
	ga.addParam('sysparm_roleData', roleData);
	ga.getXML(bulkCallback);
}

function bulkClearRoles() {
	var names = getSelectedNames();
	if (names.length === 0) return;
	if (!confirm(new GwtMessage().getMessage('Clear ALL roles from {0} feature(s)? This cannot be undone. The page will reload.', names.length))) return;

	var ga = new GlideAjax('saveFlowDesignerFeatures');
	ga.addParam('sysparm_name', 'bulkClearRoles');
	ga.addParam('sysparm_elementNames', JSON.stringify(names));
	ga.getXML(bulkCallback);
}

function bulkCallback(response) {
	var responseXML = response.responseXML;
	var answer = (responseXML && responseXML.documentElement) ?
		responseXML.documentElement.getAttribute("answer") : null;
	if (answer && answer !== "false") {
		window.location.reload();
	} else {
		alert(new GwtMessage().getMessage('Bulk operation failed. Server answer: {0}', answer));
	}
}
