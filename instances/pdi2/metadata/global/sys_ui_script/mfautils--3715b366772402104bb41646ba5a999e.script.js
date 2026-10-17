var mfa_option_selected='';
var intervalID = '';

function onEnterKeySubmit(event) {
	if (event.keyCode === 13) {
		event.preventDefault();
		// Trigger the button element with a click
		gel("sysverb_validate_mfa_code").click();
	}
}
/** This section is for Remember browser feature */
function computeFingerprintHash() {
	return new Promise(function (resolve, reject) {
		var options = {
			excludeAdBlock: true
		};
		try {
			Fingerprint2.get(options, function (components) {
				var values = components.map(function (component) { return component.value });
				var result = Fingerprint2.x64hash128(values.join(''), 31);
				var nonceVal = gel('sysparm_process_nonce').value;
				signFingerprintUsingDeviceNonce(result, nonceVal);
				resolve(true);
			});
		} catch (error) {
			jslog("Error while computing browser fingerprint hash. " + error);
			reject(error);
		}
	});
}

function signFingerprintUsingDeviceNonce(fingerprintHashValue, nonceResponse) {
	try {
		gel('bfp').value = fingerprintHashValue;
		var fingerprintHmac = CryptoJS.HmacSHA256(fingerprintHashValue.toString(), nonceResponse);
		gel('bfp_hash').value = fingerprintHmac;
	} catch (error) {
		jslog("error while signing browser fingerprint hash. " + error);
	}
}

/** This section is for FIDO validation */
function initiateRegistration(type, nickname) {
	var ajax = new GlideAjax("WebAuthentication");
	ajax.addParam("sysparm_name", "initiateRegistration");
	ajax.addParam("sysparm_nickname", nickname);
	ajax.addParam("sysparm_type", type);
	ajax.getXML(registerAutheticator.bind(this));
	return;
}

function validateRegistrationResponse(response) {
	var ajax = new GlideAjax("WebAuthentication");
	ajax.addParam("sysparm_name", "validateRegistrationResponse");
	ajax.addParam("sysparm_response", JSON.stringify(response));
	ajax.getXML(this.finishRegistration.bind(this));
	return;
}

function finishRegistration(response) {
	//gel('sys_action').value ='sysverb_validate_mfa_code';
	gel('sys_mfa_check_remembered_browser').value='false';
	gel('sys_web_authn_registration_successful').value='true';
	gel('sys_web_authn_registration_skipped').value='false';
	var res = response.responseXML.documentElement.getAttribute('answer');
	if(res == 'true'){
		document.forms[0].submit();
	}
	jslog("Finish Registration during MFA flow - Completed successfully? " + res);
}

/** This section is for email validation */
function sendMFAOTP(factor, resend) {
	multifactorSendOneTimePasswordMaxRetryReached();
	CountDownTimer(factor);
	gel('sys_mfa_factor_validate').value ="EMAIL";
	sendOneTimePasswordToEmail(factor, resend);
	gel('output_messages').style.display = 'block';
}

function sendOneTimePasswordToEmail(factor, resend) {
	var ajax = new GlideAjax("GlideOneTimePasswordGenerator");
    ajax.addParam("sysparm_name", "generateOneTimePasswordForEmailInSetupFlow");
	ajax.addParam("sysparm_factor", factor);
	ajax.addParam("sysparm_resend", resend);
    ajax.getXML(processSendOneTimePasswordToEmailResponse.bind(this));
	return;
}

function processSendOneTimePasswordToEmailResponse(response) {
    var results = response.responseXML.getElementsByTagName("result"); 
	GlideUI.get().clearOutputMessages();
    if(results && results.length >0) {
        var msg = results[0].getAttribute("msg");	
        GlideUI.get().addOutputMessage({msg: msg, type: "info", id: null});
    } else {
        var msg = response.responseXML.documentElement.getAttribute("error");
        GlideUI.get().addOutputMessage({msg: msg, type: "error", id: null});
    }
}

function multifactorSendOneTimePasswordMaxRetryReached () {
	var ajax = new GlideAjax("GlideOneTimePasswordGenerator");
	ajax.addParam("sysparm_name", "isMaxRetryReached");
	ajax.getXMLAnswer(function(answer){
		if (!!(answer))
			hideResendCode();
			return;
	});
}

function CountDownTimer(factor) {
	if( factor == "mfa_SMS_div"){
		var countdown_id  = "countdown_sms";
		var resend_id = "resend_sms"
	}
	else if( factor == "mfa_EMAIL_div"){
		var countdown_id = "countdown_email";
		var resend_id = "resend_email"
	}
	gel(resend_id).style.pointerEvents="none";
	var countDownDate = new Date().getTime() + 30 * 1000;
	intervalID = setInterval(function() {
	var current_time = new Date().getTime();
	var time_left = countDownDate - current_time;
	var seconds = Math.floor((time_left % (1000 * 60)) / 1000);
	document.getElementById(countdown_id).innerText = new GwtMessage().getMessage("in {0} seconds", seconds);
	gel(resend_id).style.color = "#666666"
	if (0 > time_left) {
		clearInterval(intervalID);
		document.getElementById(countdown_id).innerText = '';
		$j('a[id^="resend"]').removeAttr("style");
		}
	}, 1000);
}

function validateEmailOtp() {
	var userResponse = document.getElementById("txtResponse_email").value;
	if(userResponse.length != 6 || isNaN(userResponse)) {
		showError();
		return;
	}
	if(mfa_option_selected) {
		document.cookie = "factor="+ mfa_option_selected.split("_")[1] + ";max-age=5";
		gel('sys_mfa_factor_validate').value = mfa_option_selected.split("_")[1];
	}
	
	document.forms[0].submit();
}

if(document.querySelector('#factor_radio_group')){
	document.querySelector('#factor_radio_group').addEventListener("change", function() {
		if (!document.querySelector('input[type=radio][name=mfa_factor]:checked')) {
			gel("continue").disabled = true;
		} else {
			gel("continue").disabled = false;
		}
	});
}

function radioChange() {
	if (!document.querySelector('input[type=radio][name=mfa_factor]:checked')) {
		gel("continue").disabled = true;
	} else {
		gel("continue").disabled = false;
	}
}

function getFactorCookie(){
	var match = document.cookie.match(new RegExp('(^| )' + "factor" + '=([^;]+)'));
	if (match) return match[2];
	return "";
}

function hideResendCode() {
	clearInterval(intervalID);
	$j('strong[id^="countdown"]').hide();
	$j('a[id^="resend"]').hide();
}
