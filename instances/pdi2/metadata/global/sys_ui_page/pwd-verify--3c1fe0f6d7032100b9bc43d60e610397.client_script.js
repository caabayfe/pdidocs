// Show first form, others have display: none from the XML
document.forms[0].style.display = "";

setViewportForMobile();
$j('title').text("${gs.getMessage('Password Reset - Verify Step 2 out of 3')}");

// On the verification choice form (if shown), disable the unchecked checkboxes once the max number of verifications is selected. 
// When one is deselected, re-enable the other checkboxes. Also enable/disable the Next button appropriately. 
var optVerCount = parseInt('$[pwd_optional_ver_count]');
$j('#optional-verification-choice-form input').on('change', function(evt) {
	var uncheckedBoxes = getUncheckedBoxes();

	var checkedBoxesCount = $j('input:checked').length ;

	var  enoughCheckboxesSelected = checkedBoxesCount >= optVerCount;
	uncheckedBoxes.prop('disabled', enoughCheckboxesSelected);
	if(!enoughCheckboxesSelected) {
		$j('#sysverb_select_verifications_next').attr('aria-disabled', "true").attr('tabindex', '-1');
	}
	else{
		$j('#sysverb_select_verifications_next').attr('aria-disabled', "false").attr('tabindex', '0');
	}
	

});

var wasSubmitted = false;
var currentFormNumber = 0;
var totalVerForms = parseInt("$[pwd_verifications.length]");

addLoadEvent(function() {
	var listHeader = gel('verifications-list-header');
	
	if (listHeader)
		listHeader.focus();
	else
		sendEvent('macroLoaded');
});

function getUncheckedBoxes() {
	return $j('#optional-verification-choice-form input[type=checkbox]:not(:checked)');
}

// Remove forms corresponding to unchecked optional verifications and show the first verification form
function processOptionalVerificationChoices() {
	if(gel("sysverb_select_verifications_next").getAttribute("aria-disabled") == 'true' )
	return false;

	getUncheckedBoxes().each(function() {
		$j('#verification\\.' + this.id.substring(4)).remove();
		--totalVerForms;
	});
	
	// Add one for the verification selection form, otherwise we have to add special cases all over verifyResponse/showNextForm
	++totalVerForms; 
	
	_showNextForm();
}

function verifyResponse() {
	
	var currentForm = document.forms[currentFormNumber];
	
	if (!_checkRequiredInputs(currentForm) || wasSubmitted)
		return false;
	
	wasSubmitted = true;
	
	var ga = new GlideAjax('PwdAjaxVerifyProcessor');
	ga.addParam('sysparm_name','pwdAjaxVerifyProcessor');
	ga.addParam('sysparm_verification_id', currentForm.id.split('.')[1]);
	ga.addParam('sysparm_silent_request', 'true');
	_addFormValuesToAjax(ga, currentForm);
	_addFormValuesToAjax(ga, gel("pwd_master_form"));
	
	// add CSRF token for AJAX handling.
	ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);
	ga.getXML(PwdAjaxVerifyParse.bind(this), null, 'continue');
	
	return false;
}

function verifyResponses() {
	
	var currentForm = document.forms[currentFormNumber];
	if (!_checkRequiredInputs(currentForm))
		return false;
	
	wasSubmitted = true;
	
	var ga = new GlideAjax('PwdAjaxVerifyProcessor');
	ga.addParam('sysparm_name','pwdAjaxVerifyProcessor');
	for (var i=0;i<=currentFormNumber;i++){
		_addFormValuesToAjax(ga, document.forms[i]);
	}
	// add CSRF token for AJAX handling.
	ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);
	ga.addParam('sysparm_silent_request', 'true');
	ga.getXML(PwdAjaxVerifyParse.bind(this), null, 'submit');
	
	return false;
}

function _addFormValuesToAjax(ga, form) {	
	var form_inputs = form.getElementsByTagName('input');
	for (var i = 0; i < form_inputs.length; i++) {
		if (form_inputs[i].type == 'radio') {
			if (form_inputs[i].checked) {
				// Add only the value of the checked radio button
				ga.addParam(form_inputs[i].name, form_inputs[i].value);
			}
		} else {
			ga.addParam(form_inputs[i].id, form_inputs[i].value);
		}
	}
}

function PwdAjaxVerifyParse(response, action) {
	var answer = response.responseXML.documentElement.getAttribute("answer");
	
	//let's handle security from AJAX response.
	handleSecurityFrom(response);
	
	if (answer == "ok") {
		if (action == 'continue')
			_showNextForm();
		else if (action == 'submit') {
			if('$[pwd_email_reset_url]' == 'true') {
				var ga = new GlideAjax("PasswordResetUtil");
				ga.addParam("sysparm_name","sendResetEmail");
				ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);
				ga.getXML(showConfirmationPage);
			} else
				submitWithOK('$pwd_new.do');	
		}
	}
	else if (answer == "block") {
		submitWithBlock('$pwd_error.do', answer);
	}
	else {
		var retryResp = response.responseXML.getElementsByTagName("retry");
		var retry = "0";
		if ( ! (retryResp == undefined || retryResp == null || retryResp.length == 0))
			retry = retryResp[0].getAttribute("count");
		displayFieldError("password_comment_" +  document.forms[currentFormNumber].id.split('.')[1], new GwtMessage().getMessage("Error: Cannot verify user ({0}). Number of attempts: {1}. Try again", answer, retry), "verification_forms");
		
		// Also, set the UI macro to reflect this. Example, for security questions verification, randomize the questions
		if (retryResp[0].getAttribute("retry_macro"))
			$j('#qa_verification_form').html(retryResp[0].getAttribute("retry_macro"));
		
		sendEvent('macroReloaded');
	}
	wasSubmitted = false;
}

function showConfirmationPage(response){
	handleSecurityFrom(response);
	
	var answer = response.responseXML.getElementsByTagName("result");
	var result = answer[0].getAttribute("result");
	if(result == "true")
		submitWithOK('$pwd_confirm.do');
	else
		submitWithBlock('$pwd_error.do');
}
	
function _showNextForm() {
	clearError();
	if (currentFormNumber + 1 == totalVerForms)
		return verifyResponses();
	var currentForm = document.forms[currentFormNumber];
	currentForm.style.display = "none";
	var nextForm = document.forms[++currentFormNumber];
	nextForm.style.display = "";
	
	// Reset the aria-labelled by for the next verification
	gel('verification_forms').setAttribute('aria-labelledby', 'title pwd-title');
	
	sendEvent('macroLoaded');
}

function _checkRequiredInputs(formEle) {
	//Needed to display appropriate error notification if the Next button is selected before 'Send Verification   button' for SMS verification only
	if (formEle.id.split('.')[1] === "12c34f0deb6001006a668c505206fefd") {
		if (!_checkSMSCodeInputField(formEle))
			return false;
	} else if (formEle.id.split('.')[1] === "7f033bb90b000300572a6f3ef6673a74") {
		if (!_checkEmailCodeInputField(formEle))
			return false;
	}
	
	var requiredInputs = formEle.querySelectorAll("input[required]");
	for (var i = 0; i < requiredInputs.length; i++) {
		if (!requiredInputs[i].value.trim()) {
			displayFieldError("password_comment_" + document.forms[currentFormNumber].id.split('.')[1], new GwtMessage().getMessage('Error: All fields must be filled'), "verification_forms");
			requiredInputs[i].value = "";
			sendEvent('macroReloaded');
			return false;    
		}
	}
	
	return true;
}

function sendEvent(event) {
	CustomEvent.fire(event, {});
}

function _checkSMSCodeInputField(e) {
	var smsCodeInput = e.querySelector("#sysparm_answer_sms_code");
	var smsCodeSent = e.querySelector("#sms_code_sent");
	if (!_isVisible(smsCodeInput)) {
		if ((smsCodeSent.innerText).includes("You can send a new verification code")) 
			displayFieldError("password_comment_" + document.forms[currentFormNumber].id.split('.')[1], new GwtMessage().getMessage('Error: Please click Resend Verification Code before selecting \'Next\' button'), "verification_forms");
		else  
			displayFieldError("password_comment_" + document.forms[currentFormNumber].id.split('.')[1], new GwtMessage().getMessage('Error: Please click Send Verification Code before selecting \'Next\' button'), "verification_forms");		
		return false;
	}		
	return true;
}

function _checkEmailCodeInputField(e) {
	var emailCodeInput = e.querySelector("#sysparm_answer_email_code");
	var emailCodeSent = e.querySelector("#email_code_sent");
	if (!_isVisible(emailCodeInput)) {
		if ((emailCodeSent.innerText).includes("You can send a new verification code")) 
			displayFieldError("password_comment_" + document.forms[currentFormNumber].id.split('.')[1], new GwtMessage().getMessage('Error: Please click Resend Verification Code before selecting \'Next\' button'), "verification_forms");
		else  
			displayFieldError("password_comment_" + document.forms[currentFormNumber].id.split('.')[1], new GwtMessage().getMessage('Error: Please click Send Verification Code before selecting \'Next\' button'), "verification_forms");		
		return false;
	}		
	return true;
}

function _isVisible(e) {
    return !!( e.offsetWidth || e.offsetHeight || e.getClientRects().length );
}
