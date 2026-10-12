addLoadEvent(getRelevantAcls());

function getRelevantAcls() {
	var aclSysID = gel('acl_sysID').value;
	var identifier = gel('acl_identifier').value;
	var operationID = gel('acl_operationID').value;
	var resourceID = gel('acl_resourceID').value;
	var isDenyAcl = gel('acl_isDenyAcl').value;

	var originalIdentifier = gel('original_acl_identifier').value;
	var originalOperationID = gel('original_acl_operationID').value;
	var originalResourceID = gel('original_acl_resourceID').value;
	var originalIsDenyAcl = gel('original_acl_isDenyAcl').value;

	var ga = new GlideAjax("FindRelevantAcls");
	ga.addParam("sysparm_identifier", identifier);
	ga.addParam("sysparm_operationID", operationID);
	ga.addParam("sysparm_resourceID", resourceID);
	ga.addParam("sysparm_isDenyAcl", isDenyAcl);
	ga.addParam("sysparm_sysID", aclSysID);

	//if there's a change in one of the ACL keys, we need to pass that info
	//in this case, it will result in the old ACL being deleted and new one created
	var changeType = gel('change_type').value;
	if (changeType == 'modified') {
		if (originalIdentifier != identifier || originalOperationID != operationID || originalResourceID != resourceID || originalIsDenyAcl != isDenyAcl) {
			ga.addParam("sysparm_original_identifier", originalIdentifier);
			ga.addParam("sysparm_original_operationID", originalOperationID);
			ga.addParam("sysparm_original_resourceID", originalResourceID);
			ga.addParam("sysparm_original_isDenyAcl", originalIsDenyAcl);
		}
	}
	//When the change is delete, we don't care about the 'changed' value but just the original ones
	else if (changeType == 'delete') {
		ga.addParam("sysparm_identifier", originalIdentifier);
		ga.addParam("sysparm_operationID", originalOperationID);
		ga.addParam("sysparm_resourceID", originalResourceID);
	}
	ga.getXMLAnswer(displayExecutionPlan);
}

/*
Incoming plans from FindRelevantAcls:
  plan.original: Execution plan prior to changes, if not new
  plan.current: Execution plan with any changes being submitted, or a new plan
  plan.originalArchived: Execution plan if the original table is an archive
  plan.currentArchive: Execution plan if the current table is an archive
*/
function displayExecutionPlan(answer) {
	var plan = JSON.parse(answer);
	var tabHeaderParentNode = gel('operations_tab_header');
	var tabContentParentNode = gel('operation_tab_content');

	//The original code looped over the array of plans (the original plan if there is one, for the 'modified' case, and the current plan)
	//and relies on calculations based on the index of the current element and length of the array.
	//There are now up to four elements (with the addition of the archived plans) so the updated code
	//extracts specific plans but still uses the original calculations.  The archived plans are applied
	//by substituting data into the existing current and original plans if needed.
	if (plan.enableArchiveACLs === true)
		applyArchiveAcls(plan.current, plan.original, plan.currentArchived, plan.originalArchived);
	var planLength = !!plan.original + !!plan.current;

	if (plan.original)
		constructExecutionPlanView(plan.original, tabContentParentNode, tabHeaderParentNode, getChangeTypeHint(planLength, 0), getIdentifier(planLength, 0), 0);

	if (plan.current)
		constructExecutionPlanView(plan.current, tabContentParentNode, tabHeaderParentNode, getChangeTypeHint(planLength, planLength - 1), getIdentifier(planLength, planLength - 1), planLength - 1);

	//Remove the placeholder tab as all the tabs are now fully loaded
	rel('placeholder_tab');

	//Make the first tab active (changes the tab header & tab content)
	var activeTabHeader = tabHeaderParentNode.firstChild;
	activeTabHeader.setAttribute('class', 'active');
	var activeTabCaption = activeTabHeader.firstChild;
	activeTabCaption.setAttribute('class', 'active');
	activeTabCaption.setAttribute('aria-selected', 'true');

	var activeTabContent = tabContentParentNode.firstChild;
	activeTabContent.setAttribute('aria-hidden', 'false');
	activeTabContent.setAttribute('class', 'tab-pane active');
}

function applyArchiveAcls(planCurrent, planOriginal, planCurrentArchived, planOriginalArchived) {
	if (!planCurrent || (!planCurrentArchived && !planOriginalArchived))
		return;

	var identifier = gel('acl_identifier').value;
	var originalIdentifier = gel('original_acl_identifier').value;
	var changeType = gel('change_type').value;

	switch (changeType) {
		case 'add':
		case 'activated':
			useStarIfFirstTerm(planCurrent, identifier);
			break;
		case 'deactivated':
		case 'delete':
			useArchivedIfLastTerm(planCurrent, identifier, planCurrentArchived);
			break;
		case 'modified':
			useStarIfFirstTerm(planCurrent, identifier);
			useArchivedIfLastTerm(planOriginal, originalIdentifier, planOriginalArchived);
			break;
		case 'display':
		case 'untouched':
			// ignore
			break;
	}

	// Adding the first ACL for an archive table causes ACLs on the underlying table to be ignored
	function useStarIfFirstTerm(plan, id) {
		if (!plan)
			return;

		if (!id.includes('.'))
			return;

		// the last entry should be '*'
		var lastRow = plan.row[plan.row.length - 1];
		if (lastRow['*'])
			plan.row = [ lastRow ];

		// clear any field entries
		if (plan.field.length !== 0)
			plan.field = [ ];
	}

	// Removing the last ACL for an archive table reverts to the ACLs defined on the underlying table
	function useArchivedIfLastTerm(plan, id, replacement) {
		if (!plan)
			return;

		var count = 0;
		if (id.includes('.')) // only need the table name
			id = id.slice(0, id.indexOf('.'));

		// term count for the given table
		for (var i = 0; i < plan.row.length; i++) {
			if (plan.row[i][id]) {
				count += plan.row[i][id].length;
				break;
			}
		}

		// field level term count
		if (plan.archiveFieldCount)
			count += plan.archiveFieldCount;

		// use the archived terms if it is only the one left
		if (count === 1) {
			plan.row = replacement.row;
			plan.field = replacement.field;
		}
	}
}

function constructExecutionPlanView(plan, tabContentParentNode, tabHeaderParentNode, changeTypeHint, identifier, planNum) {
	var operation = plan.operation;
	var rowAcls = plan.row;
	var fieldAcls = plan.field;
	var isDenyAcl = plan.isDenyAcl;

	//When changing to an unsupported resource type, the plan will be empty and we can skip the tab
	if (operation == null)
		return;

	//First create a tab header for this operation
	var tabHeader = cel('li', tabHeaderParentNode);
	tabHeader.setAttribute('role', 'presentation');
	var tabCaption = cel('a', tabHeader);
	//both the tabs could have the same 'operation' if the identifier is changing
	tabCaption.setAttribute('id', 'tablabel_' + operation + planNum);
	tabCaption.setAttribute('aria-controls', 'tab_' + operation + planNum);
	tabCaption.setAttribute('tabindex', '0');
	tabCaption.setAttribute('role', 'tab');
	tabCaption.setAttribute('data-toggle', 'tab');
	tabCaption.setAttribute('aria-selected', 'false');
	tabCaption.setAttribute('href', '#tab_' + operation + planNum);
	tabCaption.textContent = operation.charAt(0).toUpperCase() + operation.substr(1).toLowerCase();
	
	if (isDenyAcl)
		tabCaption.textContent += ' (Deny)';
	else
		tabCaption.textContent += ' (Allow)';
		

	//Activate the tab
	$j(tabHeaderParentNode).tabs();

	//Actual tab content of the operation
	var operationNode = cel('div', tabContentParentNode);
	operationNode.setAttribute('id', 'tab_' + operation + planNum);
	operationNode.setAttribute('aria-hidden', 'true');
	operationNode.setAttribute('role', 'tabpanel');
	operationNode.setAttribute('class', 'tab-pane');
	operationNode.setAttribute('aria-labelledby', 'tablabel_' + operation + planNum);

	createAclEntries(rowAcls, "Row level", operationNode, changeTypeHint, identifier);
	createAclEntries(fieldAcls, "Field level", operationNode, changeTypeHint, identifier);
}

function createAclEntries(acls, aclLevel, operationNode, changeTypeHint, identifier) {
	var changeType = gel('change_type').value;
	var currentAclSysId = gel('acl_sysID').value;
	var isDenyAcl = gel('acl_isDenyAcl').value;

	//There are no ACLs at the current level, however this change resulted in one
	if (acls.length == 0 && isNewACL(aclLevel, identifier, changeType, changeTypeHint)) {
		createAclEntry(operationNode, aclLevel, identifier, '__NEW_ACL__', true, true, changeTypeHint, 'none');
		return;
	}

	var prevLevelAclDetails = null;
	var levelInfoAdded = false;
	for (var i=0; i<acls.length; i++) {
		var maskType = 'none';
		var thisAcl = acls[i];
		var aclNames = Object.keys(thisAcl);
		//One object will have only one ACL. So, just use the first one
		var aclName = aclNames[0];
		var aclDetails = thisAcl[aclName];

		//A new ACL is getting added/activated at the current level
		if (i == 0 && isNewACL(aclLevel, identifier, changeType, changeTypeHint)) {
			//We already have at least one ACL for the same resource path
			if (aclName == identifier)
				aclDetails.unshift('__NEW_ACL__');
			//This is a totally new ACL for this resource path
			else {
				createAclEntry(operationNode, aclLevel, identifier, '__NEW_ACL__', true, true, changeTypeHint, maskType);
				levelInfoAdded = true;
				maskType = 'masked'; //adding this ACL has probably masked some ACL in the next level
			}
		}

		var numAclsAdded = 0;
		var isAclEffective = getAclEffectiveStatus(i, aclDetails, prevLevelAclDetails, aclLevel, identifier, changeTypeHint);

		//check if this ACL is unmasked because of a deletion
		if (maskType == 'none')
			maskType = getMaskType(i, isAclEffective);

		for (var j=0; j<aclDetails.length; j++) {
			//Skip this ACL. This is the one that is shown as deleted in the first tab
			if (changeTypeHint == 'add' && changeType == 'modified' && getAclSysIdFromDetails(aclDetails[j]) == currentAclSysId)
				continue;

			createAclEntry(operationNode, aclLevel, aclName, aclDetails[j], isAclEffective, !levelInfoAdded, changeTypeHint, maskType);
			levelInfoAdded = true;
			numAclsAdded++;
		}

		if (numAclsAdded > 0)
			prevLevelAclDetails = aclDetails;
	}
}

//Create a new table row as a child of the given table node
function createAclEntry(operationNode, aclLevel, aclName, aclDetails, isAclEffective, shouldDisplayLevel, changeTypeHint, maskType) {
	var aclRow = cel('div', operationNode);
	//By default, hide the overridden ACLs
	if (!isAclEffective) {
		aclRow.setAttribute('style', 'display: none');
		aclRow.setAttribute('class', 'row overridden-acl-div');
	}
	else
		aclRow.setAttribute('class', 'row effective-acl-div');

	constructFirstColumn(aclRow, shouldDisplayLevel, aclLevel);
	constructSecondColumn(aclRow, aclName, aclDetails, isAclEffective, changeTypeHint, maskType);
}

//utility method to create the first column in the result
function constructFirstColumn(parentNode, shouldDisplayLevel, aclLevel) {
	var col1 = cel('span', parentNode);
	col1.setAttribute('class', 'col-xs-3 text-align-right first-column');
	if (shouldDisplayLevel)
		col1.textContent = aclLevel;
}

//utility method to create the second column in the result
function constructSecondColumn(parentNode, aclName, aclDetails, isAclEffective, changeTypeHint, maskType) {
	//Extract all the data from the ACL details.
	//The format is "aclSysID:::aclDescription"
	var detailsArray = aclDetails.split(':::');
	var aclSysId = detailsArray[0];
	var aclDescription = detailsArray[1];
	var	changeType = getChangeTypeForAclSysID(aclSysId);

	//Modifying one of the ACL keys is essentially deleting it and adding a new one
	if (changeType == 'modified' && changeTypeHint == 'delete')
		changeType = 'delete';

	var col2 = cel('span', parentNode);
	var containerNode = cel('div', col2);
	if (changeType == 'add')
		constructHighlightedColumnWithoutLink(aclName, col2, containerNode, 'success', new GwtMessage().getMessage("Adding"));
	else if (changeType == 'activated')
		constructHighlightedColumnWithoutLink(aclName, col2, containerNode, 'success', new GwtMessage().getMessage("Activating"));
	else if (changeType == 'delete')
		constructHighlightedColumnWithoutLink(aclName, col2, containerNode, 'error', new GwtMessage().getMessage("Deleting"));
	else if (changeType == 'deactivated')
		constructHighlightedColumnWithoutLink(aclName, col2, containerNode, 'error', new GwtMessage().getMessage("Deactivating"));
	else if (changeType == 'modified')
		constructHighlightedColumnWithoutLink(aclName, col2, containerNode, 'info', new GwtMessage().getMessage("Modifying"));
	else if (changeType == 'display')
		constructHighlightedColumnWithoutLink(aclName, col2, containerNode, 'info', new GwtMessage().getMessage("Current"));
	else if (maskType == 'masked')
		constructHighlightedColumnWithLink(aclName, col2, containerNode, 'warning', new GwtMessage().getMessage("Masking"), aclSysId, aclDescription, false);
	else if (maskType == 'unmasked')
		constructHighlightedColumnWithLink(aclName, col2, containerNode, 'success', new GwtMessage().getMessage("Unmasking"), aclSysId, aclDescription, true);
	else {
		//no highlight for the unchanged ACL
		col2.setAttribute('class', 'col-xs-9 second-column');
		constructAnchorNode(containerNode, aclSysId, aclDescription, isAclEffective, aclName);
	}
}

//Check if the given ACL identifier is at the same level passed
function isChangeOnCurrentLevel(aclLevel, identifier) {
	if (identifier.indexOf('.') == -1 && aclLevel == 'Row level')
		return true;
	else if (identifier.indexOf('.') > 0 && aclLevel == 'Field level')
		return true;

	return false;
}

//Check if the given ACL should be shown/hidden by default
function getAclEffectiveStatus(itemNum, aclDetails, prevLevelAclDetails, aclLevel, identifier, changeTypeHint) {
	//The first ACL is always shown
	if (itemNum == 0 || prevLevelAclDetails == null)
		return true;

	var changeType = gel('change_type').value;
	//check if this change exposes/hides the second level in the hierarchy
	if (itemNum == 1 && isChangeOnCurrentLevel(aclLevel, identifier)) {
		//If we've deleted/deactivated the *only* ACL on the previous level, we show this level
		if ((changeType == 'delete' || changeType == 'deactivated' || changeTypeHint == 'delete') && prevLevelAclDetails.length == 1)
			return true;
	}

	return false;
}

//checks if we are dealing with a new ACL getting added/activated
function isNewACL(aclLevel, identifier, changeType, changeTypeHint) {
	if ((changeType == 'add' || changeType == 'activated' || changeTypeHint == 'add') && isChangeOnCurrentLevel(aclLevel, identifier))
		return true;

	return false;
}

function getMaskType(itemNum, isAclEffective) {
	//If this is not the first ACL and still effective, then a previous level ACL is getting deleted/deactivated
	if (itemNum > 0 && isAclEffective)
		return 'unmasked';

	return 'none';
}

//Get the right identifier for this plan
//we need this because if the identifier itself is changed, we have old and new identifiers to deal with
function getIdentifier(planLength, planNum) {
	if (planLength > 1 && planNum == 0)
		return gel('original_acl_identifier').value;

	return gel('acl_identifier').value;
}

//One of the ACL keys is changing, so we'll have two tabs. First will be 'delete' and second will be 'add' type of change
function getChangeTypeHint(planLength, planNum) {
	if (planLength > 1 && planNum == 0)
		return 'delete';
	else if (planLength > 1 && planNum == 1)
		return 'add';

	return 'nohint';
}

function getChangeTypeForAclSysID(aclSysId) {
	var currentAclSysId = gel('acl_sysID').value;
	var changeType = gel('change_type').value;

	//A new ACL is coming into visibility
	if (aclSysId == '__NEW_ACL__') {
		if (changeType == 'activated')
			return 'activated';

		return 'add';
	}

	//Get the change type for the current ACL that is getting changed
	if (aclSysId == currentAclSysId) {
		if (changeType == 'delete' || changeType == 'display' || changeType == 'deactivated')
			return changeType;
		else
			return 'modified';
	}

	return 'untouched';
}

function getAclSysIdFromDetails(aclDetails) {
	var detailsArray = aclDetails.split(':::');
	return detailsArray[0];
}

function constructHighlightedColumnWithoutLink(aclName, column, containerNode, notificationType, hintText) {
	column.setAttribute('class', 'col-xs-9 second-column notification notification-' + notificationType);
	constructTextNode(containerNode, aclName);
	constructHintNode(hintText, containerNode);
}

function constructHighlightedColumnWithLink(aclName, column, containerNode, notificationType, hintText, aclSysId, aclDescription, isAclEffective) {
	column.setAttribute('class', 'col-md-9 second-column notification notification-' + notificationType);
	constructAnchorNode(containerNode, aclSysId, aclDescription, isAclEffective, aclName);
	constructHintNode(hintText, containerNode);
}

function constructTextNode(containerNode, aclName) {
	var textNode = cel('div', containerNode);
	textNode.setAttribute('style', 'float: left');
	textNode.textContent = aclName;
}

function constructHintNode(hint, containerNode) {
	var hintNode = cel('div', containerNode);
	hintNode.setAttribute('style', 'float: right');
	hintNode.textContent = hint;
}

function constructAnchorNode(containerNode, aclSysId, aclDescription, isAclEffective, aclName) {
	var anchorNode = cel('a', containerNode);
	anchorNode.setAttribute('style', 'float: left');
	anchorNode.setAttribute('title', aclDescription);
	anchorNode.setAttribute('target', '_blank'); //Always open in a new tab/window
	anchorNode.setAttribute('href', '/sys_security_acl.do?sys_id=' + aclSysId);
	anchorNode.setAttribute('onclick', 'sendSecurityEvent();');
	if (isAclEffective)
		anchorNode.setAttribute('class', 'effective-acl');
	else
		anchorNode.setAttribute('class', 'overridden-acl');
	anchorNode.textContent = aclName;
}

function toggleOverriddenAcls() {
	var tabContentParentNode = gel('operation_tab_content');
	var tabContents = tabContentParentNode.children;
	var toggleAcls = gel('toggle-acls');
	if (toggleAcls.textContent == 'Show All') {
		toggleAcls.textContent = 'Show Effective';
		for (var i=0; i<tabContents.length; i++) {
			$j("div.overridden-acl-div").show();
		}
	}
	else {
		toggleAcls.textContent = 'Show All';
		for (var i=0; i<tabContents.length; i++) {
			$j("div.overridden-acl-div").hide();
		}
	}
}

function invokeFunction(submissionType) {
	var gdw = GlideDialogWindow.get();
	var f;
	if (submissionType == 'continue')
		f = gdw.getPreference('onContinue');
	else if (submissionType == 'cancel')
		f = gdw.getPreference('onCancel');

	if (typeof(f) == 'function')
		f.call();

	return false;
}

function onContinue() {
	invokeFunction('continue');
}

function onCancel() {
	invokeFunction('cancel');
}

function sendSecurityEvent() {
	var ga = new GlideAjax('SecurityEventSender');
	ga.addParam('sysparm_eventName', 'acl.show.execution.plan.view.related.acl');
	ga.addParam('sysparm_parm1', '');
	ga.addParam('sysparm_parm2', '');
	ga.getXML();
}
