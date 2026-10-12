addLoadEvent(initializeVariables);
setViewportForMobile();
$j('title').text("${gs.getMessage('Password Reset - Reset')}");
var wfCheckDoneFrequency = 500; // milliseconds (this is just a default value, the real value is set from a sys_property)
var wfTimeOut = 30000; // milliseconds (this is just a default value, the real value is set from a sys_property)
var loadingDialog;
var wasSubmitted = false;
var processId;
var requestId;
var lockState;
var processSupportsUnlock;
var startTime;
var new_password = null;
var passwordMatchedRule = "${gs.getMessage('Passwords match')}";
var passwordNotMatchRule = "${gs.getMessage('Passwords must match')}";
gel('sysverb_pwd_done').style.display = 'none';

// Onload:
function initializeVariables() {
    wfCheckDoneFrequency = gel('password_reset.wf.refresh_rate').value;
    wfTimeOut = gel('password_reset.wf.timeout').value;
    autoGenPassword = (gel('sysparm_auto_gen_password').value == "true");
    supportsPasswordAsInput = (gel('sysparm_accepts_password').value == 'true');
    getLockStateSubflowMapped = (gel('sysparm_get_lock_state_subflow_mapped').value == "true");
    supportsPasswordReset = (gel('sysparm_process_supports_reset').value == 'true');

    this.processId = gel('sysparm_process_id').value;
    this.requestId = gel('sysparm_request_id').value;
    this.lockState = gel('sysparm_lock_state').value;
    this.doneButtonUrl = gel('jvar_done_button_redrect_url').value;
    this.processSupportsUnlock = (gel('sysparm_process_supports_unlock').value == "true");
    this.jvar_page = gel('jvar_page').value;

    if (this.jvar_page) {
        displayError(this.jvar_page);
    }

    if (!supportsPasswordReset && this.lockState != '2') {
        gel('user_account_locked').style.display = 'block';
        gel('user_account_not_locked').style.display = 'none';
    }

    this.startTime = new Date().getTime();
    this.password_policy_rule = gel('sysparm_password_policy_rule').value;
    this.enable_password_policy = gel('sysparm_enable_password_policy').value;
    updateLockStateMessage(this.lockState);
    enableResetButton(autoGenPassword || !supportsPasswordAsInput);
}

function displayError(jvar_page) {
    if (jvar_page == 'non_fatal_failure')
        displayFieldError("password_comment", new GwtMessage().getMessage('The new password could not be accepted because it did not meet the policy requirements. Review the password length, complexity, and history requirements and try again.'), "password_form_group");
    else if (jvar_page == 'Password reset failed from a non-fatal error. Would you like to retry?')
        displayFieldError("password_comment", new GwtMessage().getMessage('Password reset failed from a non-fatal error. Would you like to retry?'), "password_form_group");
    else if (jvar_page == 'You used that password recently. Choose a different password')
        displayFieldError("password_comment", new GwtMessage().getMessage('The new password could not be accepted because it did not meet the policy requirements. Review the password length, complexity, and history requirements and try again.'), "password_form_group");
    else if (jvar_page == 'The New Password does not meet the password policy requirements. Check the minimum password length, password complexity and password history requirements')
        displayFieldError("password_comment", new GwtMessage().getMessage('The New Password does not meet the password policy requirements. Check the minimum password length, password complexity and password history requirements'), "password_form_group");
    else if (jvar_page == 'The password does not meet the password policy requirements. Check the minimum password length, password complexity and password history requirements')
        displayFieldError("password_comment", new GwtMessage().getMessage('The password does not meet the password policy requirements. Check the minimum password length, password complexity and password history requirements'), "password_form_group");
    else
        displayFieldError("password_comment", jvar_page, "password_form_group");
}

function doneButtonRedirect() {
    if (window.top)
        window.top.location = this.doneButtonUrl;
    else
        window.location = this.doneButtonUrl;
    return false;
}

// Update the lock state image & hint:
function updateLockStateMessage(newLockState) {
    var hint;

    if (!getLockStateSubflowMapped) {
        return;
    }
    this.lockState = newLockState;
    switch (newLockState) {
        case "-1":
            hint = "${gs.getMessage('Unable to retrieve  account lock state')}";
            break;

        case "0":
            hint = "${gs.getMessage('Retrieving account lock state...')}";
            break;

        case "1":
            hint = "${gs.getMessage('Account is locked')}";
            break;

        case "2":
            hint = "${gs.getMessage('Account is not locked')}";
            enableDoneButtonAndToggleMsg();
            break;

        default:
            hint = "${gs.getMessage('Error retrieving account lock state')}";
    }
    gel('user_lock_message').innerHTML = hint;

    if (newLockState == "0") {
        setTimerForPollingLockState();
    }
}

function enableDoneButtonAndToggleMsg() {
    var unlockAccountButton = gel('sysverb_unlock_account');
    if (unlockAccountButton) {
		unlockAccountButton.setAttribute("aria-disabled", "true");
		unlockAccountButton.setAttribute("tabindex", "-1");
	}
        
    if (!supportsPasswordReset) {
        gel('sysverb_pwd_done').style.display = 'block';
        gel('user_account_locked').style.display = 'none';
        gel('user_account_not_locked').style.display = 'block';
    }
}

function setTimerForPollingLockState() {
    window.setTimeout(this.pollForLockState.bind(this), this.wfCheckDoneFrequency);
}
// Ajax call for polling lock state from the request record:
function pollForLockState() {
    var currTime = new Date().getTime();
    if (currTime - this.startTime > this.wfTimeOut) {
        // update lock state to 'failure'
        updateLockStateMessage("-1");
        return;
    }

    // Use ajax to retrieve the lock state from request record:
    var ga = new GlideAjax('PwdAjaxUserUnlockProcessor');
    ga.addParam('sysparm_name', 'pollLockStateFromRequest');
    ga.addParam('sysparam_request_id', this.requestId);
    ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);
    ga.getXMLWait();

    //Let's handle the security.
    handleSecurityFrom(ga.requestObject);

    var state = ga.getAnswer();
    updateLockStateMessage(state);
}
// Handle the reset password action:
function validatePassword(processIdIn, requestIdIn) {
    if (gel("sysverb_reset_password").getAttribute("aria-disabled") == "true")
        return false;

    if (wasSubmitted) {
        return false;
    }
    wasSubmitted = true;

    if (!autoGenPassword && supportsPasswordAsInput) {

        var foundProblem = false;
        var password = document.getElementById("sysparm_new_password");
        var retyped_password = document.getElementById("sysparm_retype_password");
        try {
            var jsonResponse = serversideValidatePassword(password.value);
            var result = JSON.parse(jsonResponse);
            if (!result.isPwdValid) {
                displayFieldError("password_comment", result.errorMessage, "password_form_group");
                foundProblem = true;
            }
        } catch (err) {
            // ignore err from isPasswordValid script, will pass to backend.
        }

        if (foundProblem) {
            wasSubmitted = false;
            return false;
        }

        new_password = password.value;
    }

    var requestId = requestIdIn;
    var processId = processIdIn;

    if ((lockState == "1") && !processSupportsUnlock) {
        var msgs = new GwtMessage();
        var dialog = new GlideDialogWindow('pwd_confirm_standard');
        dialog.setTitle(msgs.getMessage('Account Locked Warning'));
        dialog.setPreference('warning', true);
        dialog.setPreference('title', msgs.getMessage('The account is locked, resetting the password alone will not enable access. Continue?'));
        dialog.setPreference('onPromptComplete', proceedWithReset);
        dialog.render();
        wasSubmitted = false;
    } else {
        proceedWithReset();
    }

    return false;
}

function serversideValidatePassword(password) {
    var ga = new GlideAjax('PwdAjaxWFRequestProcessor');
    ga.addParam('sysparm_name', 'validatePassword');
    ga.addParam('sysparam_process_id', processId);
    ga.addParam('sysparam_new_password', password);
    ga.addParam("ni.nolog.sysparam_new_password", 'true');
    ga.getXMLWait();
    var valid = ga.getAnswer();
    return valid;
}

function proceedWithReset() {
    wasSubmitted = true;
    var wf = new PwdWfManager(wfCheckDoneFrequency, wfTimeOut);
    var redirectUrl;
    if (hasRedirectUrl() && !autoGenPassword && supportsPasswordAsInput) {
        redirectUrl = gel('redirect_url').value;
    }
    showPwdLoadingDialog();
    wf.startWfViaAjax(processId, requestId, new_password, redirectUrl);
}

// This is a callback function for handling the result of the "unlock account" workflow:
function resultCallbackForUnlockAccount(result) {
    if (result.match(/success/i)) {
        submitWithOKAndSysParam('$pwd_unlock_success.do', 'sysparm_success', 'SUCCESS');
        return;
    }
    submitWithBlock('$pwd_error.do', "${gs.getMessage('Workflow resulted in failure')}");
}

function unlockAccount(processIdIn, requestIdIn) {
    if (gel("sysverb_unlock_account").getAttribute("aria-disabled") == "true")
        return false;
    // allow submit button to be pressed only once:
    if (wasSubmitted) {
        return false;
    }
    wasSubmitted = true;

    showPwdLoadingDialog();
    // Initate the unlock user ajax call:
    var wf = new PwdUserUnlockManager(wfCheckDoneFrequency, wfTimeOut);
    wf.initiateUnlockWF(processIdIn, requestIdIn, resultCallbackForUnlockAccount);

    return false;
}

function showPwdLoadingDialog() {
    loadingDialog = new GlideModal("pwd_request_in_progress", true);
    loadingDialog.setTitle(getMessage('Request in progress'));
    if (hasRedirectUrl() && (!autoGenPassword || supportsPasswordAsInput)) {
        loadingDialog.setPreference('message', getMessage("On success, you will be redirected to the login page."));
    }
    loadingDialog.render();
}

function clearComments() {
    clearFieldError("password_comment", "password_form_group");
}

function keyPassword() {
    clearComments();
}

function keyRetype() {
    clearComments();
}

function checkPasswordStrength() {
    var password = document.getElementById("sysparm_new_password").value;
    var password_strength = calculatePasswordStrength(password);
    updatePasswordStrengthBarColors(password_strength);
    updatePasswordStrengthMessage(password_strength);
}

function getValidationRuleMap() {
    var password = document.getElementById("sysparm_new_password").value;
    var passwordPolicyRules = this.password_policy_rule;
    var parsedRules = JSON.parse(passwordPolicyRules);
    var rulesValidityMap = new Map();
    for (var i = 0; i < parsedRules.length; i++) {
        var regexp = new RegExp((parsedRules[i]).regex);
        rulesValidityMap.set(parsedRules[i].hint, regexp.test(password));
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

function updateRulesState() {
    var password = document.getElementById("sysparm_new_password");
    if (this.enable_password_policy == "true") {
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
                    password.className = "form-control pwd-reset-sub-body-new invalid-password";
                else
                    password.className = "form-control pwd-reset-sub-body-new valid-password";
            } else {
                rule.className = "icon-cross-circle pwd-cross-icon";
                rule.style.color = "";
                ruleText.className = "";
                password.className = "form-control pwd-reset-sub-body-new";
            }
        });
    }
}

function checkPasswordsEquality() {
    var password = document.getElementById("sysparm_new_password");
    var retyped_password = document.getElementById("sysparm_retype_password");
    var matchIconHtml = gel("pwd_match_icon");
    if (this.enable_password_policy == "true") {
        var validPassword = getPasswordValidity();
        var samePassword = false;
        samePassword = password.value != "" && (password.value == retyped_password.value);
        updateImageOfElement(samePassword, matchIconHtml);
        enableResetButton(validPassword && samePassword);
    } else {
        samePassword = password.value != "" && (password.value == retyped_password.value);
        updateImageOfElement(samePassword, matchIconHtml);
        enableResetButton(samePassword);
    }
}

function enablePasswordMatchHtml() {
    var retyped_password = document.getElementById("sysparm_retype_password");
    var matchHtml = gel("pwd_match");
    if (retyped_password.value.trim() != "")
        matchHtml.style.display = "block";
    else {
        matchHtml.style.display = "none";
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

function enableResetButton(condition) {
    if (!supportsPasswordReset)
        return;

    if (condition)
        $j('#sysverb_reset_password').attr('aria-disabled', false).attr('tabindex', '0');
    else
        $j('#sysverb_reset_password').attr('aria-disabled', true).attr('tabindex', '-1');
}

function showPasswords() {
    var checkbox = document.getElementById("pwd_show");
    var password = document.getElementById("sysparm_new_password");
    var retyped_password = document.getElementById("sysparm_retype_password");
    if (checkbox.checked) {
        password.type = "text";
        retyped_password.type = "text";
    } else {
        password.type = "password";
        retyped_password.type = "password";
    }
}

function updatePasswordStrengthBarColors(password_strength) {
    var strengthMeter = document.getElementById("strength-meter");
    if (strengthMeter) {
        strengthMeter.style.width = (password_strength + '%');
        strengthMeter.setAttribute("aria-valuenow", password_strength);
        if (password_strength > 80) {
            strengthMeter.className = "progress-bar progress-bar-dark-green";
            strengthMeter.style["background-color"] = "#1f8476";
        } else if (password_strength > 60) {
            strengthMeter.className = "progress-bar progress-bar-green";
            strengthMeter.style["background-color"] = "#27C48A";
        } else if (password_strength > 40) {
            strengthMeter.className = "progress-bar progress-bar-yellow";
            strengthMeter.style["background-color"] = "#F1C774";
        } else if (password_strength > 20) {
            strengthMeter.className = "progress-bar progress-bar-orange";
            strengthMeter.style["background-color"] = "#FF924E";
        } else if (password_strength > 0) {
            strengthMeter.className = "progress-bar progress-bar-red";
            strengthMeter.style["background-color"] = "#DC143C";
        }
    }
}

function updatePasswordStrengthMessage(password_strength) {
    var strengthMessage = document.getElementById("pwd_strength_text");
    if (strengthMessage) {
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
}

function hasRedirectUrl() {
    var redirectUrl = gel('redirect_url');
    return redirectUrl && redirectUrl.value;
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

function renderMaskIcon(element, inputFieldId) {
    var passwordEle = document.getElementById(inputFieldId);
    var maskEleId = element.getAttribute("id");
    var maskEle = document.getElementById(maskEleId);
    var isPasswordType = passwordEle.type === 'password';
    var maskBtnHidePwdAriaLabel = "${gs.getMessage('Hide password')}";
    var maskBtnShowPwdAriaLabel = "${gs.getMessage('Show password')}";
    maskEle.classList.toggle('active', isPasswordType);

    if (maskEleId == 'mask_icon_retype') {
        maskBtnHidePwdAriaLabel = "${gs.getMessage('Hide retype password')}";
        maskBtnShowPwdAriaLabel = "${gs.getMessage('Show retype password')}";
    }
    maskEle.setAttribute("data-original-title", (isPasswordType) ? "${gs.getMessage('Hide password')}" : "${gs.getMessage('Show password')}");
    element.setAttribute("aria-label", (isPasswordType) ? maskBtnHidePwdAriaLabel : maskBtnShowPwdAriaLabel);
    passwordEle.type = (isPasswordType) ? 'text' : 'password';
}
