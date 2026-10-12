addLoadEvent(function(){
	gel("nickName").focus();
});

function initiateRegistration() {
    var ajax = new GlideAjax("WebAuthentication");
	ajax.addParam("sysparm_name", "initiateRegistration");
	var nickname = gel('nickName').value.trim();
	if(!nickname)
		nickname = "Built-in Authenticator";
    ajax.addParam("sysparm_nickname", nickname);
	ajax.addParam("sysparm_type", "platform");
    ajax.getXML(registerAutheticator.bind(this));
    return false;
}

function validateRegistrationResponse(response) {
    var ajax = new GlideAjax("WebAuthentication");
    ajax.addParam("sysparm_name", "validateRegistrationResponse");
    ajax.addParam("sysparm_response", JSON.stringify(response));
    ajax.getXML(this.finishRegistration.bind(this));
    return false;
}

function finishRegistration(response) {
    var success = response.responseXML.documentElement.getAttribute("answer");
    if (success == "true") {
		gel("btnValidate").style.display = "none";
		gel("btnOK").style.display = "block";
        gel("nickName").readOnly = true;
		gel("biometric-info").innerHTML = new GwtMessage().getMessage("Biometric authentication has been successfully registered.");
    } else{
		var insideIframe = !!window.parent.document.getElementById("multi_factor_authenticator_widget");
		if(!insideIframe){
			close();
		}
	}
}

function close(response) {
	GlideDialogWindow.get().destroy();
}

document.addEventListener('click', function(e) {
  if (e.target.matches('[data-dismiss="GlideModal"]')) {
    location.reload();
  }
});

function closeDialog() {
	GlideDialogWindow.get().destroy();
	window.location.reload();
}
