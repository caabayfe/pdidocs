addLoadEvent(focusOnCorrectField);
setViewportForMobile();
// insert aria-label attributes for the captcha buttons
insertAriaLabelForCaptchaBtns();
$j('title').text("${gs.getMessage('Password Reset - Identify')}");

var wasSubmitted = false;
var loadingDialogWaitTime = 3000;
var displayCaptcha = false;
var googleCaptcha = true;

if(isMobile()){
	gel("redirect_url_msg").href = "/oauth_login.do";
}

function focusOnCorrectField() {
	gel('sysparm_user_id_0').focus();

	if (gel('sysparm_captcha') != undefined) {
		displayCaptcha = true;
		googleCaptcha = false;
	} else {
		if (gel('google_captcha') != undefined) {
			displayCaptcha = true;
			googleCaptcha = true;
		}
	}
}

function isMobile() {
	var ua = window.navigator.userAgent;
	if( ua.match(/Android/i) ||
		ua.match(/webOS/i) ||
		ua.match(/iPhone/i) ||
		ua.match(/iPad/i) ||
		ua.match(/iPod/i) ||
		ua.match(/BlackBerry/i) ||
		ua.match(/Windows Phone/i))
			return true;
		return false;
}

function insertAriaLabelForCaptchaBtns() {
	$j("button#captcha_button:has(i.icon-refresh)").attr("aria-label", "${gs.getMessage('Refresh CAPTCHA')}").attr("role", "button").attr("tabindex", "0");
	$j("button#captcha_button:has(i.icon-speaker)").attr("aria-label", "${gs.getMessage('Speak the CAPTCHA')}").attr("role", "button").attr("tabindex", "0");
}

function toggleNextButton() {
	var isDisabled = false;
	$j("input[name^='sysparm_user_id']").each(function(index){
		var user_id = this.value;
		if (user_id == "") {
			$j('#sysverb_pwd_reset').attr('aria-disabled', true).attr('tabindex', '-1');
			isDisabled = true;
		}
	});
	
	if(isDisabled)
		return;
	
	if (displayCaptcha && !googleCaptcha) {
		var captchaElem = gel('sysparm_captcha');
		if ((captchaElem != undefined) && (captchaElem.value == "")) {
			$j('#sysverb_pwd_reset').attr('aria-disabled', true).attr('tabindex', '-1');
			return;
		}		
	}
	$j('#sysverb_pwd_reset').attr('aria-disabled', false).attr('tabindex', '0');
	return;
}

function verifyIdentity() {
	if(gel("sysverb_pwd_reset").getAttribute("aria-disabled") == 'true' )
	return false;
	
	if (wasSubmitted) {
		return false;
	}
	wasSubmitted = true;
	
	var foundError = false;
	
	// Check user input not empty
	var idenNumber = 0;
	$j("input[name^='sysparm_user_id']").each(function(index){
		var user_id = this.value;
		if (user_id == "") {
			displayFieldError('retype_user_id_' + index, getMessage('Enter valid identity'), 'user_id_form_group_' + index);
		    foundError = true;
			return false;
		}
		idenNumber++;
	});
	
	if (displayCaptcha) {
		if (!googleCaptcha) {
	var captchaElem = gel('sysparm_captcha');
	if ((captchaElem != undefined) && (captchaElem.value == "")) {
		displayFieldError('retype_captcha', getMessage('Characters do not match, try again'), 'captcha_form_group');
		foundError = true;
	}
		}		
	}
	
	if (foundError) {
		wasSubmitted = false;
		return false;
	}
	
	var ga = new GlideAjax('PwdAjaxVerifyIdentity');
	
	ga.addParam('sysparm_name', 'verifyIdentity');
	ga.addParam('sysparm_process_id', gel('sysparm_process_id').value);
	ga.addParam('sysparm_request_source', 'Web');
	
	$j("div[id^='user_id_form_group'] input").each(function(){
		ga.addParam(this.name, this.value);
	});
	ga.addParam('sysparm_identification_number', idenNumber);
	
	
	if (displayCaptcha) {
		if (!googleCaptcha) {
			// Add built-in captcha
			var captchaElem = gel('sysparm_captcha');
			if (captchaElem != undefined && captchaElem!= null) {
				ga.addParam('sysparm_captcha', captchaElem.value);
			}
		}
	
		else {  // googleCaptcha
			// Add Google captcha
			var grc = grecaptcha.getResponse();
			if ((grc == "") || (grc == undefined)) {
				wasSubmitted = false;
				displayFieldError('retype_captcha', getMessage('Please select the checkbox above'), 'captcha_form_group');
				return false;
			}
			ga.addParam('sysparm_captcha', grc);
		}
	}
	
	// add csrf token for ajax
	ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);
	
	showPwdLoadingDialog();
	ga.getXML(PwdAjaxIdentityParse);
	return false;
}

function PwdAjaxIdentityParse(response) {
	//Let's handle security
	handleSecurityFrom(response);
	
	var answer = response.responseXML.documentElement.getAttribute("answer");
	
	if (answer == "200") {
		wasSubmitted = false;
		submitWithOK('$pwd_verify.do');
	}
	else {
		if (displayCaptcha) {
			var captchaElem = gel("retype_captcha");
			if (captchaElem != undefined) {

				refreshCaptcha();

				if (answer.indexOf("captcha") >= 0) {
					if (!googleCaptcha)
						displayFieldError('retype_captcha', getMessage('Characters do not match, try again'), 'captcha_form_group');
					else
						displayFieldError('retype_captcha', getMessage('Invalid captcha response'), 'captcha_form_group');					
				}
				else
					clearFieldError('retype_captcha', 'captcha_form_group');
			}
			hidePwdLoadingDialogAsync();
		}
			
		/* Invalid user. Redirect to the error page to be consistent with windows app.
		   Since we're obfuscating the granular user errors such as "user not in process"
		   for security reasons, just showing "Invalid user" may trigger a lot of incidents
		   By redirecting to the error page, we can show a detailed list of possible reasons
		   that the user was invalid. This is a tradeoff with UX since the user will have to 
		   go back to the previous page for every identification attempt. 
		 */
		if (answer == "500" || answer.indexOf("user") != -1)
			submitWithBlock('$pwd_error.do', "invalid user");
		else {
			$j("span[id^='retype_user_id']").each(function(index){
				userIDRetype(index);
			});
		}
		
		wasSubmitted = false;
	}
}

function isEmailAddress(str) {
	var email_pattern = /^\w+(\.\w+)*@\w+(\.\w+)+$/;
	return str.match(email_pattern);
}

function userIDRetype(index) {
	clearFieldError('retype_user_id_' + index, 'user_id_form_group_' + index);
}

function userCaptchaRetype() {
	clearFieldError('retype_captcha', 'captcha_form_group');
}

function playAudio() {
	var snd = new Audio();
	snd.autoplay = true;
	snd.src = "jcaptcha_audio.do?" + new Date().getTime();
}

function refreshCaptcha() {
	if (!googleCaptcha) {
		// Built-in Captcha:
		
	var captchaElem = gel("captcha_image");
	if (captchaElem != undefined) {
		captchaElem.src = "pwd_jcaptcha.do?" + new Date().getTime();
	}
	} else {
		// Google Captcha:
		grecaptcha.reset();
	}
	return false;
}

function switchButton(buttonToHideId, buttonToShowId) {
	var buttonToHide = gel(buttonToHideId);
	var buttonToShow = gel(buttonToShowId);
	if (buttonToHide != undefined) {
		buttonToHide.style.display = 'none';
	}
	if (buttonToShow != undefined) {
		buttonToShow.style.display = 'inline-block';
	}
}

function showPwdLoadingDialog() {
	loadingDialog = new GlideModal("pwd_request_in_progress", true);
    loadingDialog.setTitle(getMessage('Request in progress'));
    loadingDialog.render();
}

function hidePwdLoadingDialogAsync() {
	window.setTimeout(this.hidePwdLoadingDialog.bind(this), this.loadingDialogWaitTime);
}

function hidePwdLoadingDialog() {
	if (loadingDialog && loadingDialog.isOpen) {
		loadingDialog.destroy();
	}
}
