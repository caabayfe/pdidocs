addLoadEvent(function(){
	loadContent();
});

var canBypassMfaSetup = false;
var mfa_option_selected = '';
var intervalID = '';
var isPolarisEnabled = "${sn_ui.PolarisUI.isEnabled()}";
var isShowSNBrandingTaglineEnabled = gel('show_sn_branding_tagline').value;
var mfaUiPageV2VersionEnabled = true;

function loadContent(){
	var mfa_setup_completed = gel('mfa_setup_completed').value;
	if (mfa_setup_completed=='false') {
		var ajax = new GlideAjax("GlideMultifactorAuthenticator");
		ajax.addParam("sysparm_name","loadPageContent");
		ajax.getXML(this.processContent.bind(this));
	}
	return;
}

function processContent(response){
	var result = response.responseXML.getElementsByTagName("result");
	if(result && result.length > 0 ) {
		var qrCodeURL = result[0].getAttribute("qrCodeURL").toString();
		var qrCodeText = result[0].getAttribute("qrCodeText").toString();
		var canBypass = result[0].getAttribute("canBypass").toString();
		canBypassMfaSetup = canBypass;
		var bypassRemainingCount = result[0].getAttribute("bypassRemainingCount").toString();
		mfaUiPageV2VersionEnabled = result[0].getAttribute("mfaUiPageV2VersionEnabled").toString();
		gel("imgCode").src = qrCodeURL;
		gel('lblCode').innerHTML = qrCodeText;
		//This code is to redirect user to the specific macro when user was has already opened it but otp was invalid
		mfa_option_selected = gel('sys_selected_mfa_factor').value;
		//initial page load condition
		if(mfa_option_selected == '' || mfa_option_selected == "null"){
			gel("linkBypassSetup").style.display = canBypass == "true" ? "inline" : "none";
			gel("remainingBypassCountPara").style.display = canBypass == "true" ? "block" : "none";
			if(canBypass == "true"){
				gel("remainingBypassCount").innerHTML = ' '+bypassRemainingCount+ ' ';
				if(mfaUiPageV2VersionEnabled == 'true')
					gel("continue").style.marginBottom = canBypassMfaSetup == "true" ? "30px" : "0";
				else
					gel("btnValidate").style.marginBottom = canBypassMfaSetup == "true" ? "45px" : "0";
			}
			setCSSForBranding();
			return;
		}

		//page load after otp validation failure
		if(mfa_option_selected == 'mfa_TOTP_div' || mfa_option_selected == 'mfa_EMAIL_div'){
			gel('mfa_options').style.display = 'none';
			gel(mfa_option_selected).style.display = 'block';
			gel("linkBypassSetup").style.display = 'none';
			gel("remainingBypassCountPara").style.display = 'none';
		}
		if(isPolarisEnabled == 'true' && mfa_option_selected == 'mfa_TOTP_div'){
			var loginContainer = document.getElementById('mfa_container');
			loginContainer.setAttribute("class", "login-container wide");
		}
	}
}

//[ONLY Polaris] this CSS fine tuning is to accomodate the "Works With ServiceNow" brand logo across MFA setup pages
//Doing it this way since various MFA factor pages have different page width and require different spacings
function setCSSForBranding(){
    if (isShowSNBrandingTaglineEnabled != 'true' || canBypassMfaSetup != 'true' || isPolarisEnabled != 'true') return;
    
    var isMfaV2 = mfaUiPageV2VersionEnabled == 'true';
    var footerId = isMfaV2 ? 'login_card_footer_mfaV2' : 'login_card_footer_mfaV1';
    var noOptionsSelected = !mfa_option_selected || mfa_option_selected == "null";
    
	if(gel(footerId))
		gel(footerId).style.marginBottom = noOptionsSelected ? '20px' : '0';
}

function goBack() {
    gel('divNotification').style.display = 'none';
	gel('sys_selected_mfa_factor').value = '';
    gel('mfa_options').style.display = 'block';
    gel(mfa_option_selected).style.display = 'none';
	if(isPolarisEnabled == 'true'){
		var loginContainer = document.getElementById('mfa_container');
		loginContainer.setAttribute("class", "login-container");
	}
	gel("linkBypassSetup").style.display = canBypassMfaSetup == "true" ? "inline" : "none";
	gel("remainingBypassCountPara").style.display = canBypassMfaSetup == "true" ? "block" : "none";
    GlideUI.get().clearOutputMessages();
    clearInterval(intervalID);
	loadContent();
}

function continueToSetup() {
    var selected = document.querySelector('input[type=radio][name=mfa_factor]:checked');
    mfa_option_selected = selected.value;
    gel('mfa_options').style.display = 'none';
    gel(mfa_option_selected).style.display = 'block';
	gel("linkBypassSetup").style.display = 'none';
	gel("remainingBypassCountPara").style.display = 'none';
    if (selected.value == "mfa_EMAIL_div") {
        sendMFAOTP(selected.value);
    }
	gel('sys_selected_mfa_factor').value = mfa_option_selected;
	if(isPolarisEnabled == 'true' && (mfa_option_selected === 'mfa_TOTP_div')){
		var loginContainer = document.getElementById('mfa_container');
		loginContainer.setAttribute("class", "login-container wide");
	}
	setCSSForBranding();
}

function bypassSetup(){
	gel('hdnBypassSetup').value = "true";
	document.forms[0].submit();
}

function validateResponse(){
	var lblError = document.getElementById("lblError");
	var userResponse = document.getElementById("txtResponse").value;
	if(userResponse.length != 6 || isNaN(userResponse)) {
		showError();
		return false;
	}

	document.forms[0].submit();
}

function showError(){
	gel("divNotification").setAttribute('class', "notification notification-error");
	gel("divNotification").style.display = "block";
	gel("divNotification").innerHTML = new GwtMessage().getMessage("Your Passcode is incorrect. Please try again with a correct code.");
	if (gel("output_messages")) gel("output_messages").style.display = "none";//Clear the error from server if one exists so that we don't show the error twice
	return false;
}

function copyCodeToClipboard(){
  var text = gel('lblCode').innerHTML.trim();
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  $j('#cod_cop_msg').show().text(new GwtMessage().getMessage('Copied to clipboard'));
}
