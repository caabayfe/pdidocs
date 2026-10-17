function initiateOAuthFlow() {
	showNotification("Retrieving OAuth Token...");
	var use_mid = gel("use_mid").value;
	var mid_server = gel("mid_server").value;
	var requestor = gel("requestor").value;
	var personal = gel("personal").value;
	var requestor_context = gel("requestor_context").value;
	var oauth_provider_profile = gel("oauth_provider_profile").value;
	var oauth_provider_id = gel("oauth_provider_id").value;
	
	if(!requestor) {
		showError('Requestor is empty');
		return;
	}
	
	if(!requestor_context) {
		showError('Requestor Context is empty');
		return;
	}
	
	if(!oauth_provider_profile && !oauth_provider_id) {
		showError('OAuth Provider Profile is empty');
		return;
	}
	
	var oauthConsumerSupport = new GlideAjax('OAuthConsumerSupport');
	oauthConsumerSupport.addParam('sysparm_name', 'initiateCCTokenFlow');
	oauthConsumerSupport.addParam('oauth_requestor', requestor);
	oauthConsumerSupport.addParam('oauth_personal', personal);
	oauthConsumerSupport.addParam('oauth_requestor_context', requestor_context);
	oauthConsumerSupport.addParam('oauth_provider_profile', oauth_provider_profile);
	oauthConsumerSupport.addParam('oauth_provider_id', oauth_provider_id);
	oauthConsumerSupport.addParam('use_mid', use_mid);
	oauthConsumerSupport.addParam('mid_server', mid_server);
	
	// Invoke the GlideAjax with a callback function
	oauthConsumerSupport.getXML(parseAjaxResponse);
	return;
}

function parseAjaxResponse(response) {
	var result = response.responseXML.getElementsByTagName("result");
	var isToken = result[0].getAttribute("isToken");
	var responseCode = result[0].getAttribute("responseCode");
	var errorMessage = result[0].getAttribute("errorMessage");
	if(isToken == 'true') {
		showSuccess('OAuth token flow completed successfully');
		refreshOpener();
		// close it in seconds		
		setTimeout(closeSelf, 3000);
		return;
	} else {
		showError('OAuth flow failed. Verify the configurations and try again. Error detail:' + errorMessage);
		return;
	}
}

function closeSelf() {
	if (window.opener) {
		window.close();
	}
}

function refreshOpener() {
	if (window.opener) {
		window.opener.location.reload();
	}
}

function showError(msg){
	gel("divNotification").setAttribute('class', "notification notification-error");
    showNotification(msg);
}

function showSuccess(msg){
	gel("divNotification").setAttribute('class', "notification notification-success");
	showNotification(msg);
}

function showNotification(msg){
	gel("divNotification").style.display = "block";
	gel("divNotification").innerHTML = new GwtMessage().getMessage(msg);
	if (gel("output_messages")) gel("output_messages").style.display = "none";//Clear the error from server if one exists so that we don't show the error twice
}
