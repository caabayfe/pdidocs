// When the page gets loaded, execute the event handler for on-load event.

$j('title').text("${gs.getMessage('Password Reset - Change Password')}");
var ruleHints = {};

addLoadEvent(
    function() {
        populateProcessSelect('${gs.getUserID()}');
    }
);

var isPasswordPolicyEnabled, rulesWithRegex = [];


backButtonHandler();
function backButtonHandler() {
	if (window.history.length <= 1) {
        return;
    }
	var backBtn = gel("back_btn");
	if (backBtn && backBtn.getAttribute("aria-disabled") == "true"){
		backBtn.setAttribute("aria-disabled", false);
	}
	else{
		window.history.back();
	}
}

function isPasswordValid(password) {
    var selectFieldElem = document.getElementById("processSelectId");
    var procIdentificationFieldElem = document.getElementById("processIdentificationId");
    var procId = procIdentificationFieldElem.options[selectFieldElem.selectedIndex].text;
    var funcName = "isPasswordValid_" + procId;
    var result = window[funcName](password);
    return result;
}

function calculatePasswordStrength(password) {
    var selectFieldElem = document.getElementById("processSelectId");
    var procIdentificationFieldElem = document.getElementById("processIdentificationId");
    var procId = procIdentificationFieldElem.options[selectFieldElem.selectedIndex].text;
    var funcName = "calculatePasswordStrength_" + procId;
    var result = window[funcName](password);
    return result;
}


var loadingDialog;
var startTime;
var new_password = null;
var old_password = null;
var wfCheckDoneFrequency = 500; // milliseconds (this is just a default value, the real value is set from a sys_property)
var wfTimeOut = 30000; // milliseconds (this is just a default value, the real value is set from a sys_property)
var wfContextSysId;
var wasSubmitted = false;
var procId;
var passwordMatchedRule = "${gs.getMessage('Passwords match')}";
var passwordNotMatchRule = "${gs.getMessage('Passwords must match')}";

function updatePwdRuleHint() {
    var selectFieldElem = document.getElementById("processSelectId");
    var ruleFieldElem = document.getElementById("processRuleId");
    var pwdRuleHintFieldElem = document.getElementById("pwdRuleHintId");
    var enablePasswordPolicyElem = document.getElementById("enablePasswordPolicyId");
    var pwdPolicyRuleHintElem = document.getElementById("pwdPolicyRuleHintId");
    var newPasswordPolicyElem = document.getElementById('newPasswordPolicy');

    if (selectFieldElem != undefined && ruleFieldElem != undefined && pwdRuleHintFieldElem != undefined && enablePasswordPolicyElem != undefined && pwdPolicyRuleHintElem != undefined && newPasswordPolicyElem != undefined) {
        isPasswordPolicyEnabled = (enablePasswordPolicyElem.options[selectFieldElem.selectedIndex].value == 'true');
        if (isPasswordPolicyEnabled) {
            generateRules(pwdPolicyRuleHintElem.options[selectFieldElem.selectedIndex].value);
            pwdRuleHintFieldElem.style.display = "none";
            newPasswordPolicyElem.style.display = "block";
        } else {
            pwdRuleHintFieldElem.style.display = "block";
            newPasswordPolicyElem.style.display = "none";
            var hintText = "<p>${gs.getMessage('Password Requirements: ')}</p>" + ruleFieldElem.options[selectFieldElem.selectedIndex].text;
            pwdRuleHintFieldElem.innerHTML = hintText;
        }
    }
}

function generateRules(rules) {
    var newPasswordPolicyElem = document.getElementById('newPasswordPolicy');
    var rulesJSON = JSON.parse(rules);
    rulesWithRegex = [];
    var rulesWithoutRegex = [];
    var msg = getMessage("We'll also check these requirements once you submit");
    for (var i = 0; i < rulesJSON.length; i++) {
        if (JSON.stringify(rulesJSON[i]) != undefined) {
            if (rulesJSON[i].regex != "") {
                rulesWithRegex.push(rulesJSON[i]);
            } else {
                rulesWithoutRegex.push(rulesJSON[i]);
            }
        }
    }
    var html = [];
    html.push("<label class=\"sr-only\">${gs.getMessage(',Password rules are,')}</label>");
    rulesWithRegex.forEach(function(rule) {
        html.push("<div id=\"rule_" + rule.hint + "\" class=\"pwd-rule\">");
        html.push("<i id=\"rule_" + rule.hint + "_image\" class=\"icon-cross-circle pwd-cross-icon\" aria-hidden=\"true\"></i>");
        html.push("<span id=\"rule_" + rule.hint + "_text\">" + rule.hint + "</span>");
        html.push("</div>");
    });

    if (rulesWithoutRegex.length > 0) {
        html.push("<div id=\"rule_separator\" class=\"pwd-rule\" style=\"font-weight:bold; font-size:14px;\">");
        html.push("<span>" + msg + "</span>");
        html.push("</div>");
        html.push("<ul style=\"margin-left: -25px;\">");
        rulesWithoutRegex.forEach(function(rule) {
            html.push("<li id=\"rule_" + rule.hint + "\" class=\"pwd-rule\">" + rule.hint + "</li>");
        });
        html.push("</ul>");
    }
    newPasswordPolicyElem.innerHTML = html.join("");
}

function updatePwdStrengthVisibility() {
    var selectFieldElem = document.getElementById("processSelectId");
    var pwdVisibilityFieldElem = document.getElementById("pwdStrengthVisibilityId");

    if ((selectFieldElem != undefined) && (pwdVisibilityFieldElem != undefined)) {
        var pwdStrengthContainer = document.getElementById("password_strength_container");
        var strengthMeter = document.getElementById("strength-meter");
        var strengthMessage = document.getElementById("pwd_strength_text");
        var shouldShow = pwdVisibilityFieldElem.options[selectFieldElem.selectedIndex].value;
        if (shouldShow == "true") {
            pwdStrengthContainer.style.display = "flex";
            strengthMeter.setAttribute("aria-valuenow", "0");
            strengthMeter.className = "progress-bar progress-bar-danger";
            strengthMessage.innerHTML = getMessage("Strength");
        } else {
            pwdStrengthContainer.style.display = "none";
        }
    }
}

// populate select box with processes available to user
function populateProcessSelect(user_id) {
    wfCheckDoneFrequency = gel('password_reset.wf.refresh_rate').value;
    wfTimeOut = gel('password_reset.wf.timeout').value;

    var sel = document.getElementById("processSelectId");
    var rules = document.getElementById("processRuleId");
    var identifications = document.getElementById("processIdentificationId");
    var pwdStrengthVisibilities = document.getElementById("pwdStrengthVisibilityId");
    var enablePasswordPolicy = document.getElementById("enablePasswordPolicyId");
    var pwdPolicyRuleHintElem = document.getElementById("pwdPolicyRuleHintId");

    var ga = new GlideAjax('PwdAjaxChangePassword');
    ga.addParam('sysparm_name', 'getProcessesForUser');
    ga.addParam('sysparm_user', user_id);
    ga.getXML(function(response) {

        var res = response.responseXML.getElementsByTagName("response");
        if (res[0]) {
            var status = res[0].getAttribute("status");
            var message = res[0].getAttribute("message");
            if (status.match(/snc_read_only_role_error/i)) {
                submitWithBlock('$pwd_change_error.do', message);
                return;
            }
        }

        var processes = response.responseXML.getElementsByTagName("process");
        var numProcesses = processes.length;
        for (var i = 0; i < processes.length; i++) {
            var name = processes[i].getAttribute("name");
            var pwdRuleHint = processes[i].getAttribute("pwdRuleHint");
            var procId = processes[i].getAttribute("procId");
            var ruleFunc = processes[i].getAttribute("pwdRule");
            var enablePasswordStrength = processes[i].getAttribute("enablePasswordStrength");
            var strengthFunc = processes[i].getAttribute("strengthRule");
            var isPasswordPolicyEnabled = processes[i].getAttribute("enablePasswordPolicy");
            var pwdPolicyRuleHint = processes[i].getAttribute("pwdPolicyRuleHint");

            var selection = i + 1;
            if (numProcesses == 1) {
                selection = i;
            }
            sel[selection] = new Option(name, procId);
            rules[selection] = new Option(pwdRuleHint, pwdRuleHint);
            identifications[selection] = new Option(procId, procId);
            pwdStrengthVisibilities[selection] = new Option(name, enablePasswordStrength);
            enablePasswordPolicy[selection] = new Option(isPasswordPolicyEnabled, isPasswordPolicyEnabled);
            pwdPolicyRuleHintElem[selection] = new Option(pwdPolicyRuleHint, pwdPolicyRuleHint);

            // dynamically inject isPasswordValid_procId and calculatePasswordStrength_procId 
            // functions into the DOM
            var scriptElem = document.createElement('script');
            scriptElem.type = 'text/javascript';
            scriptElem.text = ruleFunc + "\n\n" + strengthFunc;
            document.body.appendChild(scriptElem);
        }

        if (numProcesses > 1) {
            //if there are more than one process available, show "select a process"
            sel[0] = new Option("${gs.getMessage('-- None --')}", 0);
            sel.selectedIndex = 0;
            showPasswordChangeForm(numProcesses);
        } else if (numProcesses == 1) {
            sel.selectedIndex = 0;
            updatePwdRuleHint();
            updatePwdStrengthVisibility();
            showPasswordChangeForm(numProcesses);
            updateMandatoryMarker(sel, 'process_select_pass_form_group');
        } else {
            document.location = "$pwd_change_error.do?sysparm_error=no_process";
        }
    });
}

function showPasswordChangeForm(numProcesses) {
    document.getElementById("passwordChangeFormId").style.display = "block";
    if (numProcesses > 1) {
        showHidePasswordChangeFormFields();
    }
}

function showHidePasswordChangeFormFields() {
    // Do not show the form fields for hint, old, new pwd, pwd button until user selects process
    var sel = document.getElementById("processSelectId");
    var processName = sel.options[sel.selectedIndex].text;
    gel('pwd_match').style.display = "none";

    if (processName == ('${gs.getMessage("-- None --")}').trim()) {
        // Hide form fields
        updateDisplayPasswordChangeFormFields("none");
    } else {
        // Show form fields
        updateDisplayPasswordChangeFormFields("block");
    }
}

function updateDisplayPasswordChangeFormFields(style) {
    gel('process_details').style.display = style;
}

// change password event from the button handled
function changePassword(user_id) {
    if (gel("sysverb_pwd_change").getAttribute("aria-disabled") == "true")
        return false;

    if (wasSubmitted) {
        return false;
    }
    wasSubmitted = true;

    // clear existing error messages
    clearFieldError('error_msg_old_pass', 'old_pass_form_group');
    clearFieldError('error_msg_new_pass', 'new_pass_form_group');
    clearFieldError('error_msg_confirm_pass', 'confirm_pass_form_group');

    var sel = document.getElementById("processSelectId");
    var processName = sel.options[sel.selectedIndex].text;
    var procId = sel.options[sel.selectedIndex].value;
    var foundError = false;

    if (processName == ('${gs.getMessage("-- None --")}').trim()) {
        displayFieldError("error_msg_select", getMessage("Invalid selection"), "process_select_pass_form_group");
        wasSubmitted = false;
        foundError = true;
    }

    if (document.getElementById("sysparm_old_pass").value == '') {
        displayFieldError("error_msg_old_pass", getMessage("Cannot be empty"), "old_pass_form_group", getMessage("Old password cannot be empty"));
        wasSubmitted = false;
        foundError = true;
    }

    if (document.getElementById("sysparm_new_password").value == '') {
        displayFieldError("error_msg_new_pass", getMessage("Cannot be empty"), "new_pass_form_group", getMessage("New password cannot be empty"));
        wasSubmitted = false;
        foundError = true;
    }

    if (foundError) {
        return false;
    }

    var old_password = document.getElementById("sysparm_old_pass").value;
    var new_password = document.getElementById("sysparm_new_password").value;
    if (old_password == new_password) {
        displayFieldError("error_msg_new_pass", getMessage("Old and new password cannot be the same"), "new_pass_form_group");
        wasSubmitted = false;
        return false;
    }

    if (!isValidPassword(procId)) {
        wasSubmitted = false;
        return false;
    }

    // Initate change password user ajax call:
    startChangePasswordWF(user_id, procId, old_password);
    return false;
}

// Triggers the workflow to change the user's password:
function startChangePasswordWF(userId, procId, old_pass) {
    startTime = new Date().getTime();
    this.procId = procId;

    showPwdLoadingDialog();
    var ga = new GlideAjax('PwdAjaxChangePassword');
    ga.addParam('sysparm_name', 'changePassword');
    ga.addParam('sysparm_user', userId);
    ga.addParam('sysparm_procId', procId);
    ga.addParam('sysparam_new_password', new_password);
    ga.addParam("ni.nolog.sysparam_new_password", "true");
    ga.addParam('sysparam_old_password', old_pass);
    ga.addParam("ni.nolog.sysparam_old_password", "true");
    ga.getXML(function(response) {
        var res = response.responseXML.getElementsByTagName("response");
        var status = res[0].getAttribute("status");
        var message = res[0].getAttribute("message");
        wfContextSysId = res[0].getAttribute("value");
        if (status.match(/failure/i)) {
            submitWithBlock('$pwd_change_error.do', message);
            return;
        } else if (status.match(/block/i)) {
            submitWithBlock('$pwd_change_error.do', 'block');
            return;
        }

        // start the polling for the workflow result
        setTimeoutForChangePasswordRefresh();
    });
}

function setTimeoutForChangePasswordRefresh() {
    window.setTimeout(checkChangePwdWF, wfCheckDoneFrequency);
}

//check if the execution is through workflow or flow.
function isFlow() {
    var ga = new GlideAjax('PwdAjaxWFRequestProcessor');
    ga.addParam('sysparm_name', 'isFlow');
    ga.addParam('sysparm_process_id', this.procId);
    ga.getXMLWait();
    return ga.getAnswer();
}

// poll the result of the workflow
function checkChangePwdWF() {
    var currTime = new Date().getTime();
    if (currTime - startTime > wfTimeOut) {
        resultCallback('timeout');
        return;
    }

    var is_flow = isFlow().toString();
    if (is_flow == 'true') {
        loadingDialog.destroy();
        submitWithOKAndSysParam('$pwd_change_success.do', 'sysparm_success', 'SUCCESS');
    } else {
        var ga = new GlideAjax('PwdAjaxChangePassword');
        ga.addParam('sysparm_name', 'checkChangePwdWFState');
        ga.addParam('sysparam_wf_context_sys_id', wfContextSysId);
        ga.getXML(function(response) {
            var res = response.responseXML.getElementsByTagName("response");
            var status = res[0].getAttribute("status");
            var value = res[0].getAttribute("value");

            if (!status.match(/finished/i)) {
                setTimeoutForChangePasswordRefresh();
                return;
            }
            // everything done, finalize
            resultCallback(value);
        });
    }
}

// finalize the result, and show to user.
function resultCallback(result) {
    loadingDialog.destroy();
    if (result.match(/success/i)) {
        submitWithOKAndSysParam('$pwd_change_success.do', 'sysparm_success', 'SUCCESS');
        return;
    } else if (result.match(/incorrect old password/i)) {
        submitWithBlock('$pwd_change_error.do', 'incorrect old password');
        return;
    } else if (result.match(/non fatal failure/i)) {
        submitWithBlock('$pwd_change_error.do', 'non fatal failure');
        return;
    } else if (result.match(/pwd history check failed/i)) {
        submitWithBlock('$pwd_change_error.do', 'pwd history check failed');
        return;
    }
    submitWithBlock('$pwd_change_error.do', "${gs.getMessage('Change password request resulted in failure')}");
}

function isValidPassword(processId) {
    var foundProblem = false;
    var password = document.getElementById("sysparm_new_password");
    var retyped_password = document.getElementById("sysparm_confirm_pass");

    if (password.value != retyped_password.value) {
        displayFieldError("error_msg_confirm_pass", getMessage("New and retype password must be the same"), "confirm_pass_form_group");
        foundProblem = true;
    }
    try {
        var jsonResponse = serversideValidatePassword(processId, password.value);
        var result = JSON.parse(jsonResponse);
        if (!result.isPwdValid) {
            displayFieldError("error_msg_new_pass", result.errorMessage, "new_pass_form_group");
            foundProblem = true;
        }
    } catch (err) {
        // ignore err from isPasswordValid script, will pass to backend.
    }

    if (foundProblem) {
        return false;
    }

    new_password = password.value;
    return true;
}

function serversideValidatePassword(processId, password) {
    var ga = new GlideAjax('PwdAjaxWFRequestProcessor');
    ga.addParam('sysparm_name', 'validatePasswordForChange');
    ga.addParam('sysparam_process_id', processId);
    ga.addParam('sysparam_new_password', password);
    ga.addParam("ni.nolog.sysparam_new_password", 'true');
    ga.getXMLWait();
    var valid = ga.getAnswer();
    return valid;
}

function displayFieldError(field, message, formGroup, ariaLabel) {
    fieldElem = gel(field);
    if (fieldElem != undefined) {
        fieldElem.classList.add("icon-alert");
        fieldElem.innerHTML = " " + message;

        $j("[aria-describedby='" + field + "']").attr('aria-invalid', 'true');
        if (ariaLabel)
            fieldElem.setAttribute("aria-label", ariaLabel);
    }

    $j('#' + formGroup).addClass("has-error");
}

function clearFormFields() {
    // Clear all fields
    gel('sysparm_old_pass').value = "";
    gel('sysparm_new_password').value = "";
    gel('sysparm_confirm_pass').value = "";

    // Clear mandatory markers to required.
    updateMandatoryMarker(gel('sysparm_new_password'), 'new_pass_form_group');
    updateMandatoryMarker(gel('sysparm_old_pass'), 'old_pass_form_group');
    updateMandatoryMarker(gel('sysparm_confirm_pass'), 'confirm_pass_form_group');

    // Clear strength bar.
    checkPasswordStrength();

    // Clear all error fields.
    clearFieldError('error_msg_select', 'process_select_pass_form_group');
    clearFieldError('error_msg_old_pass', 'old_pass_form_group');
    clearFieldError('error_msg_new_pass', 'new_pass_form_group');
    clearFieldError('error_msg_confirm_pass', 'confirm_pass_form_group');
}

function clearFieldError(field, formGroup) {
    fieldElem = gel(field);
    if (fieldElem != undefined) {
        fieldElem.classList.remove("icon-alert");
        fieldElem.innerHTML = '';
        fieldElem.removeAttribute("aria-label");

        $j("[aria-describedby='" + field + "']").attr('aria-invalid', 'false');
    }

    $j('#' + formGroup).addClass("is-required");
    $j('#' + formGroup).removeClass("has-error");
}

function clearErrorWhenNotEmpty(field, errorField, formGroup) {
    fieldElem = gel(field);
    if (fieldElem != undefined && fieldElem.text != '') {
        clearFieldError(gel(errorField), formGroup);
    }
}

function clearNewPasswordErrors() {
    clearFieldError('error_msg_new_pass', 'new_pass_form_group');
    clearFieldError('error_msg_confirm_pass', 'confirm_pass_form_group');
}

function showPwdLoadingDialog() {
    loadingDialog = new GlideModal("pwd_request_in_progress", true);
    loadingDialog.setTitle(getMessage('Request in progress'));
    loadingDialog.render();
}

function checkPasswordStrength() {
    var password = document.getElementById("sysparm_new_password").value;
    var password_strength = calculatePasswordStrength(password);
    updatePasswordStrengthBarColors(password_strength);
    updatePasswordStrengthMessage(password_strength);
}

function updatePasswordStrengthBarColors(password_strength) {
    var strengthMeter = document.getElementById("strength-meter");
    strengthMeter.style.width = (password_strength + '%');
    strengthMeter.setAttribute("aria-valuenow", password_strength);
    if (password_strength > 80) {
        strengthMeter.className = "progress-bar progress-bar-dark-green";
    } else if (password_strength > 60) {
        strengthMeter.className = "progress-bar progress-bar-green";
    } else if (password_strength > 40) {
        strengthMeter.className = "progress-bar progress-bar-yellow";
    } else if (password_strength > 20) {
        strengthMeter.className = "progress-bar progress-bar-orange";
    } else if (password_strength > 0) {
        strengthMeter.className = "progress-bar progress-bar-red";
    }
}

function updatePasswordStrengthMessage(password_strength) {
    var strengthMessage = document.getElementById("pwd_strength_text");
    if (password_strength > 80) {
        strengthMessage.innerHTML = getMessage("Great");
    } else if (password_strength > 60) {
        strengthMessage.innerHTML = getMessage("Good");
    } else if (password_strength > 40) {
        strengthMessage.innerHTML = getMessage("Okay");
    } else if (password_strength > 20) {
        strengthMessage.innerHTML = getMessage("Weak");
    } else if (password_strength > 0) {
        strengthMessage.innerHTML = getMessage("Poor");
    } else {
        strengthMessage.innerHTML = getMessage("Strength");
    }
}


function enablePasswordMatchHtml() {
    var confirmPassword = document.getElementById("sysparm_confirm_pass");
    var pwdMatchRule = gel("pwd_match");
    if (confirmPassword.value.trim() != "") {
        pwdMatchRule.style.display = "block";
    } else {
        pwdMatchRule.style.display = "none";
    }
}

function updatePasswordMatchRule() {
    var pwdMatchRuleTextIcon = gel("pwd_match_icon");
    var pwdMatchRuleText = gel("pwd_match_rule");
    var pwdMatchRule = gel("pwd_match");
    var isPwdMatch = pwdMatchRuleTextIcon.classList.contains("pwd-success-icon");
    if (isPwdMatch) {
        pwdMatchRuleText.innerText = passwordMatchedRule;
    } else {
        pwdMatchRuleText.innerText = passwordNotMatchRule;
    }
}

function getValidationRuleMap() {
    var password = document.getElementById("sysparm_new_password").value;
    var rulesValidityMap = new Map();
    for (var i = 0; i < rulesWithRegex.length; i++) {
        var regexp = new RegExp((rulesWithRegex[i]).regex);
        rulesValidityMap.set(rulesWithRegex[i].hint, regexp.test(password));
    }
    return rulesValidityMap;
}


function getPasswordValidity() {
    var rulesValidityMap = getValidationRuleMap();
    var validPassword = true;
    rulesValidityMap.forEach(function(value, key) {
        if (value == false)
            validPassword = false;
    });
    return validPassword;
}

function updateImageOfElement(value, element, ruleText) {
    if (value) {
        element.className = "icon-success-circle pwd-success-icon";
        if (ruleText)
            ruleText.className = "pwd-success-icon";
    } else {
        element.className = "icon-error-circle pwd-error-icon";
        if (ruleText)
            ruleText.className = "pwd-error-icon";
    }
}

function checkPasswordsEquality() {
    var oldPassword = document.getElementById("sysparm_old_pass");
    var isOldPasswordEmpty = (oldPassword.value.trim() == "");
    var password = document.getElementById("sysparm_new_password");
    var confirmPassword = document.getElementById("sysparm_confirm_pass");
    var matchIconHtml = gel("pwd_match_icon");
    var validPassword = getPasswordValidity();
    var samePassword = false;
    samePassword = password.value != "" && (password.value == confirmPassword.value);
    updateImageOfElement(samePassword, matchIconHtml);
    enableChangePasswordButton(validPassword && samePassword && !isOldPasswordEmpty);
}

function enableChangePasswordButton(condition) {
    document.getElementById("sysverb_pwd_change").setAttribute("aria-disabled", !condition);
}

function updateRulesState() {
    if (isPasswordPolicyEnabled) {
        var password = document.getElementById("sysparm_new_password");
        var rulesValidityMap = getValidationRuleMap();
        var isPasswordValid = getPasswordValidity();
        rulesValidityMap.forEach(function(value, key) {
            var ruleId = "rule_" + key + "_image";
            var rule = gel(ruleId);
            var ruleTextId = "rule_" + key + "_text";
            var ruleText = gel(ruleTextId);
            if (password.value.trim() != "") {
                updateImageOfElement(value, rule, ruleText);
                if (!isPasswordValid)
                    password.className = "form-control pwd-form-control invalid-password";
                else
                    password.className = "form-control pwd-form-control valid-password";
            } else {
                rule.className = "icon-cross-circle pwd-cross-icon";
                password.className = "form-control pwd-form-control";
                ruleText.className = "";
            }
        });
    }
}

function renderMaskIcon(element, inputFieldId) {
    var passwordEle = document.getElementById(inputFieldId);
    var maskEleId = element.getAttribute("id");
    var maskEle = document.getElementById(maskEleId);
    var isPasswordType = passwordEle.type === 'password';
    var maskBtnHidePwdAriaLabel = "${gs.getMessage('Hide new password')}";
    var maskBtnShowPwdAriaLabel = "${gs.getMessage('Show new password')}";
    maskEle.classList.toggle('active', isPasswordType);

    if (maskEleId == 'mask_icon_old') {
        maskBtnHidePwdAriaLabel = "${gs.getMessage('Hide old password')}";
        maskBtnShowPwdAriaLabel = "${gs.getMessage('Show old password')}";
    }
    if (maskEleId == 'mask_icon_retype') {
        maskBtnHidePwdAriaLabel = "${gs.getMessage('Hide retype password')}";
        maskBtnShowPwdAriaLabel = "${gs.getMessage('Show retype password')}";
    }

    maskEle.setAttribute("data-original-title", (isPasswordType) ? "${gs.getMessage('Hide password')}" : "${gs.getMessage('Show password')}");
    element.setAttribute("aria-label", (isPasswordType) ? maskBtnHidePwdAriaLabel : maskBtnShowPwdAriaLabel);
    passwordEle.type = (isPasswordType) ? 'text' : 'password';
}
