var gDialog = null;
var initialActionName = "";
var formAlreadySubmitted = false;
var acceptedLocalSA = "";

function onSubmit() {
    // Turn off confirmation dialog for non-heisenberg page
    if (window.isDoctype) {
        if (!window.isDoctype())
            return;
        else if (document.documentElement.getAttribute('data-doctype') != 'true')
            return;
    }

    initialActionName = g_form.getActionName();

    if (formAlreadySubmitted)
        return true;

    // If we're deleting an ACL there's no need for the empty ACL warning popup - just show the execution plan
    if (isActionDelete(initialActionName)) {
        if (showConfirmAclExecutionPlan())
            return false;
    } else {
        if (showACLFormErrorDialog())
            return false;
    }
    return true;
}

function showEmptyACLWarningPopup() {
    // if the emptyACLPopupEnabled property is true, enforce empty ACL popup window - otherwise we skip to the execution plan
    if (g_scratchpad.emptyACLPopupEnabled != 'true') {
        return false;
    }

    /**
     * if there is no Roles list or Security Attribute section, we cannot confirm that the user has added them on the client
     * side - we will not show the popup, since these are the two things they may add from it. Rely on back-end empty ACL
     * validation instead
     */
    if ((typeof GlideList2 !== 'undefined' && GlideList2.getByName('sys_security_acl.sys_security_acl_role.sys_security_acl') == null) || (document.getElementById("element.sys_security_acl.security_attribute.condition") == null || document.getElementById("element.sys_security_acl.security_attribute") == null)) {
        return false;
    }

    if (!isEmptyOrInvalidACL()) // if the ACL is valid, we go right to the execution plan
        return false;

    var emptyACLWarningPopup = new GlideModal('empty_acl_warning_popup');
    emptyACLWarningPopup.setTitle(getMessage('Empty ACL - Select Role or Security Attribute'));

    emptyACLWarningPopup.render();
    return true;

    function isEmptyOrInvalidACL() {
        if (isConditionValid())
            return false;

        if (isScriptValid())
            return false;

        if (isSecurityAttributeValid())
            return false;

        if (isRolesListValid())
            return false;

        if (hasControlledByRefsValue())
            return false;

        return true;
    }

    function isConditionValid() {
        var condition = g_form.getValue('condition');

        return (condition != 'null') && (condition != '');
    }

    function isSecurityAttributeValid() {
        return g_form.getValue('security_attribute');
    }

    function hasControlledByRefsValue() {
        return g_form.getValue('controlled_by_refs');
    }

    function isRolesListValid() {
        if (typeof GlideList2 === 'undefined') {
            return true;
        }
        var rolesList = GlideList2.getByName('sys_security_acl.sys_security_acl_role.sys_security_acl');
        var rolesRows = rolesList.table.getElementsBySelector('tr.list_row');
        var numberOfCrossedOutRows = rolesList.table.getElementsBySelector('tr.list_delete').length;
        var isRolesListEmpty = (rolesRows.length - 1) == 0; // the 'add a role' row always takes up one spot in the list
        var isRolesListEmptyAfterSave = ((rolesRows.length - 1) - (numberOfCrossedOutRows)) < 1;

        // if 'add a role ...' component is not included in the list, do not consider it when making calculations
        if (rolesList.table.getElementsBySelector('i.icon-add').length == 0) {
            isRolesListEmpty = rolesRows.length == 0;
            isRolesListEmptyAfterSave = (rolesRows.length - numberOfCrossedOutRows) < 1;
        }

        return !(isRolesListEmpty || isRolesListEmptyAfterSave);
    }

    function isScriptValid() {
        var script = g_form.getValue('script');

        return script && (script.trim().length != 0) && (script.replace(/(\/\*[^*]*\*\/)|(\/\/[^*\n]*)/g, '').trim().length != 0); // this regex strips the comments from the script, then we assert the remaining script is empty (or all whitespace)
    }
}

function showConfirmAclExecutionPlan() {

    // We care only about the 'record' type, as there is no hierarchical inheritance for other types
    // So in those cases, there's no need to show the execution plan
    var aclType = gel('sys_display.original.sys_security_acl.type').value;

    if (g_form.isNewRecord())
        aclType = gel('sys_security_acl.type').value;

    if (aclType != 'record')
        return false;

    // Intercept only add/delete/modify operations
    if (!isActionInsert(initialActionName) && !isActionDelete(initialActionName) && initialActionName != 'sysverb_update' && initialActionName != 'sysverb_update_and_stay')
        return false;

    formAlreadySubmitted = false;
    var sysId = g_form.getUniqueValue();
    var aclName = g_form.getValue('name');

    var isDenyAcl = false;
    var decisionType = g_form.getValue('decision_type');
    if (decisionType == 'deny')
        isDenyAcl = true;

    // If one of the following ACL keys are changed, we are essentially creating a new ACL and deleting the old one
    var originalAclName = gel('sys_original.sys_security_acl.name').value;

    var originalOperationSysID = gel('sys_original.sys_security_acl.operation').value;

    var originalResourceName = gel('sys_display.original.sys_security_acl.type').value;

    var originalIsDenyAcl = false;
    var originalDecisionTypeElem = gel('sys_original.sys_security_acl.decision_type');
    var originalDecisionType = null;
    // if originalDecisionType is null, the decision_type field is not in the form, so we read from g_scratchpad set in business rule
    if (originalDecisionTypeElem == null)
        originalDecisionType = g_scratchpad.originalDecisionType;
    else
        originalDecisionType = originalDecisionTypeElem.value;

    if (originalDecisionType == 'deny')
        originalIsDenyAcl = true;
    // if the decision type field is not on the form, it hasn't changed
    if (decisionType == '' || decisionType == null)
        isDenyAcl = originalIsDenyAcl;

    // Get the active status before and after the update
    var isActive = g_form.getValue('active');
    var wasActive = gel('sys_original.sys_security_acl.active').value;

    // If this is an inactive record, that remains inactive, no reason to display the plan
    if (isActive != 'true' && wasActive != 'true')
        return false;

    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    // Height is a dummy parameter. The window is automatically sized for its height
    gDialog = new dialogClass("acl_execution_plan", false, 450, 300);
    gDialog.setPreference('sysparm_identifier', aclName);

    // This is a form submission, so it is fair to assume at this point that
    // We can access the option control to get the name of the operation
    var optionControl = g_form.getOptionControl('operation');
    var operationText;
    var operationValue;
    if (optionControl) {
        var option = g_form.getOption('operation', g_form.getOptionControl('operation').value);
        operationText = option.text;
        operationValue = option.value;
    } else {
        operationText = gel('label.sys_security_acl.operation').value;
        operationValue = gel('sys_security_acl.operation').value;
    }

    gDialog.setPreference('sysparm_operationID', operationValue);
    gDialog.setPreference('sysparm_resourceID', aclType);
    gDialog.setPreference('sysparm_isDenyAcl', isDenyAcl);

    gDialog.setPreference('sysparm_showButtons', 'true');

    var hasAclKeyChanged = isChangeInAclKey(aclName, originalAclName, aclType, originalResourceName, operationValue, originalOperationSysID);

    var hasAclActiveStateChanged = isChangeInAclState(isActive, wasActive);
    var actionName = g_form.getActionName();

    var changeType = getChangeType(isActive, wasActive, hasAclKeyChanged);

    // if changed ACL from allow to deny (or vice-versa) then need to display the popup
    var hasDenyAclChanged = (isDenyAcl != originalIsDenyAcl);

    // If there is no change in the key fields-name, operation,type;
    // If this is not an insert, insert and stay, insert with roles then there is no need to display the popup
    // Ensure we are displaying the popup for Delete action
    // Display the popup when ACL has changed type from allow to deny or vice-versa
    if (!hasAclKeyChanged && !hasAclActiveStateChanged && !isActionInsert(actionName) && !isActionDelete(actionName) && !hasDenyAclChanged)
        return false;

    // If we are trying to insert an inactive ACL record, no need to display the popup
    if (isActive != 'true' && (isActionInsert(actionName) || g_form.isNewRecord()))
        return false;

    if ((actionName.indexOf('delete') > 0) || (isActive == 'false' && hasAclKeyChanged && hasAclActiveStateChanged)) {
        gDialog.setPreference('sysparm_change_type', 'delete');
        gDialog.setPreference('sysparm_sysID', sysId);
        // If this is a delete, then use the original name for the dialog header as well
        // If this is a "Save" on an existing ACL, as Inactive, whose key has changed, then use the original name for dialog header as well
        aclName = originalAclName;
    } else if (isActive == 'true' && (actionName.indexOf('insert') > 0 || g_form.isNewRecord())) {
        gDialog.setPreference('sysparm_change_type', 'add');
    } else if (!hasAclKeyChanged && !hasDenyAclChanged) {
        gDialog.setPreference('sysparm_change_type', changeType);
        gDialog.setPreference('sysparm_sysID', sysId);
    } else if (isActive == 'true' && hasAclKeyChanged && hasAclActiveStateChanged) {
        gDialog.setPreference('sysparm_change_type', 'add');
        gDialog.setPreference('sysparm_sysID', sysId);
        // If this is a "Save" on an existing ACL, as active, whose key has changed, then use the original name for dialog header as well
        aclName = originalAclName;
    } else {
        gDialog.setPreference('sysparm_change_type', 'modified');
        gDialog.setPreference('sysparm_sysID', sysId);
    }

    gDialog.setPreference('sysparm_original_identifier', originalAclName);
    gDialog.setPreference('sysparm_original_operationID', originalOperationSysID);
    gDialog.setPreference('sysparm_original_resourceID', originalResourceName);
    gDialog.setPreference('sysparm_original_isDenyAcl', originalIsDenyAcl);


    gDialog.setTitle(new GwtMessage().getMessage("Verify Security Rules for \"{0}\"", aclName));
    gDialog.setPreference('onContinue', continueSubmission);
    gDialog.setPreference('onCancel', cancelSubmission);
    gDialog.render();
    return true;
}

function showACLFormErrorDialog() {
    if (showDuplicateSAWarning())
        return true;
    if (showEmptyACLWarningPopup())
        return true;
    return showConfirmAclExecutionPlan();
}

function showDuplicateSAWarning() {
    // existing SAs already get checked on creation
    if (g_form.getValue('local_or_existing') === 'Existing')
        return false;

    var currCondition = g_form.getValue('security_attribute.condition');
    if (currCondition == acceptedLocalSA)
        return false;

    if (checkForMatchingCondition(currCondition, 'false'))
        return true;

    if (checkForExistingEqualsTrue(currCondition))
        return true;

    return false;

    function checkForMatchingCondition(currCondition, includeLocal) {
        var ga = new GlideAjax('global.SecurityAttributeUtil');
        ga.addParam('sysparm_name', 'checkIfConditionExists');
        ga.addParam('sysparm_attribute_condition', currCondition);
        ga.addParam('sysparm_include_local', includeLocal);
        ga.getXMLWait();
        var answer = ga.getAnswer();
        if (!answer || answer == _getLabelAndName().name)
            return false;
        var gr = new GlideRecord('sys_security_attribute');
        gr.addQuery('name', answer);
        gr.query();
        if (gr.next()) {
            initializeDialog(gr);
            gDialog.render();
            return true;
        }
        return false;
    }

    /**
     * Handle cases of Local Security Attributes with conditions like UserIsAuthenticated=true,
     * as these can be reassigned to use the existing Security Attribute directly.
     */
    function checkForExistingEqualsTrue(currCondition) {
        if (currCondition.endsWith('=true')) {
            var gr = new GlideRecord('sys_security_attribute');
            // remove the trailing "=true" from the condition
            gr.addQuery('name', currCondition.slice(0, -5));
            gr.query();
            if (gr.next()) {
                initializeDialog(gr);
                gDialog.render();
                return true;
            }
        }
        return false;
    }

    function dupExistingSAModify() {
        if (g_form.isNewRecord())
            deleteCreatedLocalSA();
        g_form.setValue("local_or_existing", "Existing");
        g_form.setValue("security_attribute", gDialog.getPreference("otherRecord"));
        gDialog.destroy();
        continueAction();
        return true;
    }

    function dupSAContinue() {
        var currCondition = g_form.getValue('security_attribute.condition');
        updateOrCreateLocalSA(currCondition);
        g_form.setValue('security_attribute.condition', currCondition);
        acceptedLocalSA = currCondition;
        gDialog.destroy();
        continueAction();
        return true;
    }

    function initializeDialog(otherGr) {
        var dialogClass = GlideModal ? GlideModal : GlideDialogWindow;
        gDialog = new dialogClass("duplicate_existing_secattr_warning_popup", false, 450, 300);
        gDialog.setTitle(getMessage("Create Local Duplicate of Existing Security Attribute?"));
        gDialog.setPreference('dupSAContinue', dupSAContinue);
        gDialog.setPreference('dupSAModify', dupExistingSAModify);
        gDialog.setPreference('otherRecord', otherGr.sys_id);
        gDialog.setPreference('otherRecordName', otherGr.name);
        return gDialog;
    }

    function updateOrCreateLocalSA(currCondition) {
        var labelAndName = _getLabelAndName();
        var ga = new GlideAjax('global.SecurityAttributeUtil');
        ga.addParam('sysparm_name', 'updateOrCreateLocalSA');
        ga.addParam('sysparm_label', labelAndName.label);
        ga.addParam('sysparm_name0', labelAndName.name);
        ga.addParam('sysparm_condition', currCondition);
        ga.getXMLWait();
        var answer = ga.getAnswer();
        g_form.setValue('security_attribute', answer);
        g_form.setValue('security_attribute.condition', currCondition);
    }

    function deleteCreatedLocalSA() {
        var oldSA = g_form.getValue("security_attribute");
        var ga = new GlideAjax('global.SecurityAttributeUtil');
        ga.addParam('sysparm_name', 'deletePrevLocalAttribute');
        ga.addParam('sysparm_attribute_id', oldSA);
        ga.getXML();
    }

    function _getLabelAndName() {
        var label = 'ACL_' + g_form.getUniqueValue();
        var scope = g_scratchpad.scope;
        var prefix = (!scope || scope == 'global') ? '' : scope + '__';
        var name = prefix + label;
        return {"label": label, "name": name};
    }
}

function getChangeType(aclActive, originalAclActive) {
    if (aclActive == 'true' && originalAclActive == 'false')
        return 'activated';
    else if (aclActive == 'false' && originalAclActive == 'true')
        return 'deactivated';
}

// Returns true if acl state has changed
function isChangeInAclState(aclActive, originalAclActive) {
    return aclActive != originalAclActive;
}

// Returns true if one of ACL Identifier, type or operation has changed
function isChangeInAclKey(aclId, originalId, aclType, originalType, aclOp, originalOp) {
    if (aclId != originalId || aclType != originalType || aclOp != originalOp)
        return true;
    return false;
}

// Check if any the action is some form of insert
function isActionInsert(action) {
    return (action == 'sysverb_insert' || action == 'sysverb_insert_and_stay' || action == 'sys_security_acl_insert_with_roles');
}

// Check if any the action is some form of delete.
function isActionDelete(action) {
    return action == 'sysverb_delete_custom' || action == 'sysverb_delete';
}

function continueAction() {
    var actionName = g_form.getActionName();
    var actionElement = gel(actionName);
    if (actionElement)
        gsftSubmit(actionElement);
}

function continueSubmission() {
    formAlreadySubmitted = true;
    gDialog.destroy();
    continueAction();
}

function cancelSubmission() {
    sendSecurityEvent();
    gDialog.destroy();
}

function sendSecurityEvent() {
    var ga = new GlideAjax('SecurityEventSender');
    ga.addParam('sysparm_eventName', 'acl.show.execution.plan.cancel.updates');
    ga.addParam('sysparm_parm1', '');
    ga.addParam('sysparm_parm2', '');
    ga.getXML();
}
