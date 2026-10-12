addLateLoadEvent(function() {

    // Needed because of $page
    window.g_form = new GlideForm();

    function displayErrorMessage(msg) {
        g_form.clearMessages();
        g_form.addErrorMessage(msg);
    };

    /**
     * Displays error messages if any found in the url.
     */
    function displayErrorMessages(errorMessages) {
        // clear any outstanding messages first.
        g_form.clearMessages();

        if (!errorMessages) {
            return;
        }

        var str = decodeURIComponent(errorMessages);
        str = str.trim();

        if (str.length == 0) {
            return;
        }

        var messages = str.split('^____^');

        for (var i = 0; i < messages.length; i++) {

            var msg = messages[i];
            msg = msg.trim();

            if (msg.length == 0)
                continue;

            g_form.addErrorMessage(htmlEntities(msg));
        }
    }

    window.displayErrorMessage = displayErrorMessage;
    window.displayErrorMessages = displayErrorMessages;
});

function sendRequest() {
    var ga = new GlideAjax('SoftPINAjaxProcessor');
    ga.addParam('sysparm_name', 'enroll');
    ga.addParam('sysparm_silent_request', 'true');

    var verificationList = [];
    var forms = document.forms;
    var formIndex = 0;
    var paramIndex = 0;
    var currForm;

    for (var i = 0; i < forms.length; i++) {
        currForm = forms[i];

        try {
            if (currForm.name.indexOf("softpin_auth_factor_enroll_ui") != -1) {
                paramIndex = addParams(paramIndex, ga, currForm, 'sysparm_macro_' + formIndex + '_data');
                verificationList.push([currForm.elements['verification_id'].value, currForm.elements['verification_name'].value]);
                formIndex++;
            }
        } catch (err) {
            continue;
        }
    }

    ga.addParam('sysparm_form_count', formIndex);
    ga.addParam('sysparm_total_count', paramIndex);
    ga.getXML(handleResponse, null, verificationList);
}

/** Add parameters to the AJAX request (ga) based on the form elements */
function addParams(offset, ga, aForm, formId) {
    var elms = aForm.elements;
    var paramIndex = offset;

    for (var i = 0; i < elms.length; i++) {
        try {
            var name = elms[i].name;
            var value = elms[i].value;

            if (name == undefined || name == '')
                continue;

            var paramName = 'sysparm_param_' + paramIndex;
            var paramVal = formId + ":" + name + '=' + value;
            ga.addParam(paramName, paramVal);
            paramIndex++;
        } catch (err) {}
    }
    return paramIndex;
}

function handleResponse(response, verificationList) {
    var isSuccess = 'true';
    var errorMessages = '';

    for (var i = 0; i < verificationList.length; i++) {
        var verificationId = verificationList[i][0];
        var verificationName = verificationList[i][1];
        var res = response.responseXML.getElementsByTagName("_" + verificationId);
        try {
            var status = res[0].getAttribute("status");
            var message = res[0].getAttribute("message");
            if (status == 'success') {
                gel('pin_changed').value = false;
                lastSubmittedSoftPin = gel('softpin_input').value;
            }
            if (status != 'success') {
                // concat the error messages with ^____^ separator.
                var msg = new GwtMessage().getMessage("Enrollment for {0} failed. The reason: {1}", verificationName, message);
                errorMessages = errorMessages + '^____^' + encodeURIComponent(msg);
                isSuccess = 'false';
            }
        } catch (err) {
            //should not happen.
            alert(err.message);
            isSuccess = 'false';
        }
    }

    // Redirect the page to the success page if all turn out fine. Stay on the same page without redirecting
    // if only some of the forms passed validation. 
    if (isSuccess == 'true') {
        if (validFormsCount == onSubmitEventHandlers.length)
            window.location = "softpin_enrollment_success.do";
        return;
    }

    displayErrorMessages(errorMessages);
}

/**
 * Escape unsafe special html characters
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMaskIcon(element, inputFieldId) {
    var passwordEle = document.getElementById(inputFieldId);
    var maskEleId = element.getAttribute("id");
    var maskEle = document.getElementById(maskEleId);
    var isPasswordType = passwordEle.type === 'password';
    var maskBtnHidePwdAriaLabel = "${gs.getMessage('Hide password')}";
    var maskBtnShowPwdAriaLabel = "${gs.getMessage('Show password')}";
    maskEle.classList.toggle('active', isPasswordType);
    maskEle.setAttribute("data-original-title", (isPasswordType) ? maskBtnHidePwdAriaLabel : maskBtnShowPwdAriaLabel);
    element.setAttribute("aria-label", (isPasswordType) ? maskBtnHidePwdAriaLabel : maskBtnShowPwdAriaLabel);
    passwordEle.type = (isPasswordType) ? 'text' : 'password';
}
