addLoadEvent(function(){
	var shouldLoad =  gel('mfa_setup_change').value;
	if (shouldLoad == "false") {
		loadContent();
	} else{
		gel("resetDiv").style.display = "block";
	}
});

function loadContent(){
	var ajax = new GlideAjax("GlideMultifactorAuthenticator");
	ajax.addParam("sysparm_name", "loadPopupContent");
	ajax.getXML(this.processContent.bind(this));
}

function processContent(response){
	var result = response.responseXML.getElementsByTagName("result");
	if(result && result.length > 0 ) {
		var validated = result[0].getAttribute("validated");
		var qrCodeURL = result[0].getAttribute("qrCodeURL");
		var qrCodeText = result[0].getAttribute("qrCodeText");
		var canDisable = result[0].getAttribute("canDisable");
		var registrationTime = result[0].getAttribute("registrationTime");
		gel('imgCode').src = qrCodeURL;
		gel('lblCode').innerHTML = qrCodeText;
		if(validated == "true") {
			//Succcessfully setup MFA code.
			gel("btnRemove").style.display = "none";
			gel("btnClose").className = "btn btn-primary";
			gel("btnClose").innerHTML = new GwtMessage().getMessage("OK"); 
			gel("info-authenticator").innerHTML = new GwtMessage().getMessage("Multi-factor authentication has been succesfully configured."); 
			gel("mfa_setup_instruction").style.display = "none";
			gel("resetDiv").style.display = "block";
			gel("divNotification").style.display = "none";
			if(gel('mfa_setup_change').value == "true") {
				gel("totp_registration_time").style.display = "none";
			}
			gel("totp_registration_time_updated").style.display = "block";
			gel('totp_registration_time_updated').innerHTML = new GwtMessage().getMessage("Registration time: {0}", registrationTime);
			
			
		} else {
			//Succcessfully generated MFA code.
			if(gel('mfa_reset').value == "true") {
				gel("mfa_setup_instruction").style.display = "flex";
				gel("txtResponse").value = "";
				gel("resetDiv").style.display = "none";
				gel("divNotification").setAttribute('class', "notification notification-info");
				gel("divNotification").style.display = "block";
				gel("divNotification").innerHTML = new GwtMessage().getMessage("Scan this QR code to pair your new mobile device");
			} else{
				gel('mfa_reset').value="false";
				gel("divNotification").style.display = "none"; //First time display
				gel("mfa_setup_instruction").style.display = "flex";
				gel("txtResponse").value = "";
				gel("resetDiv").style.display = "none";
			}
			gel("tdValidate").style.display = "block";
			gel("txtResponse").value = "";
		}
	}
}

function validateResponse(){
	var userResponse = document.getElementById("txtResponse").value.trim();
	if(userResponse.length != 6 || isNaN(userResponse))
		showError();
	
	var ajax = new GlideAjax("GlideMultifactorAuthenticator");
    ajax.addParam("sysparm_name", "validateResponse");
	ajax.addParam("sysparm_response", userResponse);
	var pairNewDeviceFlag = document.getElementById("pairNewDevice").value.trim();
	if(pairNewDeviceFlag=="true")
		ajax.addParam("sysparm_updateUserRecord", "false");
	else
		ajax.addParam("sysparm_updateUserRecord", "true");
	
	ajax.getXML(this.processResponse.bind(this));
}

function processResponse(response){
	var result = response.responseXML.getElementsByTagName("result");
	if(result && result.length > 0 ) {
		var validated = result[0].getAttribute("validated");
		if(validated == 'true')
			loadContent();
		else
			showError();
		
	} else
		showError();
}

function showError(){
	gel("divNotification").setAttribute('class', "notification notification-error");
	gel("divNotification").style.display = "block";
	gel("divNotification").innerHTML = new GwtMessage().getMessage("Your Passcode is incorrect. Please try again with a correct code.");
	gel("txtResponse").value = "";
	return false;
}

function resetCode() {
	var areYouSure = confirm(new GwtMessage().getMessage("Are you sure you want to replace your existing authenticator code?"));
	if(areYouSure == true){
		gel("pairNewDevice").value = "true";
		gel('mfa_reset').value = "true";
		var ajax = new GlideAjax("GlideMultifactorAuthenticator");
		ajax.addParam("sysparm_name", "resetCode");
		ajax.getXML(this.processContent.bind(this));
		forgetAllRememberedBrowsersCall();
	}
}

function closeDialog() {
	GlideDialogWindow.get().destroy();
	window.location.reload();
}

document.addEventListener('click', function(e) {
  if (e.target.matches('[data-dismiss="GlideModal"]')) {
    location.reload();
  }
});function copyCodeToClipboard(){
  var text = gel('lblCode').innerHTML.trim();
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.getElementById("mfa_setup_step2").appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
  document.getElementById("mfa_setup_step2").removeChild(textArea);
  $j('#cod_cop_msg').show().text(new GwtMessage().getMessage('Copied to clipboard'));
}
