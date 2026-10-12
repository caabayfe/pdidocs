(function executeRule(current, previous /*null when async*/ ) {

    var currJson = current.getValue("service_account_json");

    //validations
    if (!currJson) {
        gs.addErrorMessage(gs.getMessage('Service Account Json cannot be empty'));
        current.setAbortAction(true);
        return;
    }

    if (current.operation() == "insert") {
        refreshAccessTokenAndUpdate();
        return;
    }

    if (current.operation() == "update") {
        var prevJson = previous.getValue("service_account_json");
        if (currJson != prevJson) {
            refreshAccessTokenAndUpdate();
        }
		if(current.getValue('auth_token') != previous.getValue('auth_token')) {
			gs.addErrorMessage(gs.getMessage('Auth Token cannot be manually updated'));
			current.setAbortAction(true);
			return;
		}
    }

    function refreshAccessTokenAndUpdate() {
        var currDecryptedJson = current.service_account_json.getDecryptedValue();
        var accessToken = JSON.parse(SNC.FcmAuthTokenUtil.refreshFcmAccessToken(currDecryptedJson));
        if (accessToken && accessToken.tokenValue && accessToken.expirationTimeMillis) {
            current.auth_token = accessToken.tokenValue;
            var gdt = new GlideDateTime();
            gdt.setValue(accessToken.expirationTimeMillis);
            current.token_expiry_on = gdt.getDisplayValue();
        } else {
            gs.error('FCM Oauth HTTP V1 API: accessToken or tokenValue or expirationTimeMillis are empty for ' +
                current.sys_id);
            gs.addErrorMessage(gs.getMessage('Unable to update Access Token'));
            current.setAbortAction(true);
        }
    }


})(current, previous);
