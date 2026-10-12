function initiateOAuthFlow() {
	var username = gel("username").value;
	var password = gel("password").value;
	var requestor = gel("requestor").value;
	var personal = gel("personal").value;
	var requestor_context = gel("requestor_context").value;
	var oauth_provider_profile = gel("oauth_provider_profile").value;
	var oauth_provider_id = gel("oauth_provider_id").value;
	var use_mid = gel("use_mid").value;
	var mid_server = gel("mid_server").value;

	if(!username) {
		showError('Username is empty');
		return;
	}

	if(!password) {
		showError('Password is empty');
		return;
	}

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

	var gaOAuthPasswordGrantType = new GlideAjax('OAuthPasswordGrantType');
	gaOAuthPasswordGrantType.addParam('sysparm_name', 'initiateTokenFlow');
	gaOAuthPasswordGrantType.addParam('oauth_requestor', requestor);
	gaOAuthPasswordGrantType.addParam('oauth_personal', personal);
	gaOAuthPasswordGrantType.addParam('oauth_requestor_context', requestor_context);
	gaOAuthPasswordGrantType.addParam('oauth_provider_profile', oauth_provider_profile);
	gaOAuthPasswordGrantType.addParam('oauth_provider_id', oauth_provider_id);
	gaOAuthPasswordGrantType.addParam('username', username);
	gaOAuthPasswordGrantType.addParam('password', password);
	gaOAuthPasswordGrantType.addParam('use_mid',use_mid);
	gaOAuthPasswordGrantType.addParam('mid_server', mid_server);
	// Invoke the GlideAjax with a callback function
	gaOAuthPasswordGrantType.getXML(parseAjaxResponse);
	return;
}

function parseAjaxResponse(response) {
	var result = response.responseXML.getElementsByTagName("result");
	var isToken = result[0].getAttribute("isToken");
	var responseCode = result[0].getAttribute("responseCode");
	var errorMessage = result[0].getAttribute("errorMessage");
	var tokenExchangeProfileId = gel("token_exchange_profile_id").value;
	if(isToken == 'true') {
		if(tokenExchangeProfileId) {
			window.location.replace(buildTokenExchangeRedirectURL(tokenExchangeProfileId));
			return;
		}
		showSuccess('OAuth token flow completed successfully');
		refreshOpener();
		return;
	} else {
		showError('OAuth flow failed. Verify the configurations and try again. Error detail:' + errorMessage);
		return;
	}
}

function buildTokenExchangeRedirectURL(tokenExchangeProfileId) {
	var url = '/oauth_noninteractive_input.do?sysparm_oauth_requestor_context=' + encodeURIComponent(gel("requestor_context").value)
		+ '&sysparm_oauth_requestor=' + encodeURIComponent(gel("requestor").value)
		+ '&sysparm_oauth_provider_profile=' + encodeURIComponent(tokenExchangeProfileId);
	var personal = gel("personal").value;
	if (personal !== '')
		url += '&sysparm_oauth_personal=' + encodeURIComponent(personal);
	var use_mid = gel("use_mid").value;
	if (use_mid !== '')
		url += '&sysparm_use_mid=' + encodeURIComponent(use_mid);
	var mid_server = gel("mid_server").value;
	if (mid_server !== '')
		url += '&sysparm_mid_server=' + encodeURIComponent(mid_server);
	return url;
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

function onKeyPressed(event) {
	if(event.keyCode == 13){
		event.preventDefault();
		initiateOAuthFlow();
	}
}

function ignoreEnter(event) {
    if (event.keyCode == 13) {
        event.preventDefault();
        return false;
    }
    return true;
}

if (window.addEventListener) {
    window.addEventListener("keypress", function(e) {
            onKeyPressed(e);
        });
}
