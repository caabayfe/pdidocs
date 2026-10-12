function refreshOpenerAndCloseSelf(session_id) {
	var opener = window.top.opener;
    if (opener) {
		var path = opener.location.pathname;
		var portalId = path.split('/')[1];
		var prefix = 'SN.NOW_ASSIST_DIALOG_APP:v1:' + portalId + ':';
		var matchedKey = null;
		var localStorage = opener.localStorage;
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			if (key && key.indexOf(prefix) === 0) {
				matchedKey = key;
				break;
			}
		}

		var value = null;
		if (matchedKey !== null) {
			value = localStorage.getItem(matchedKey);
			var appModeKey = prefix + session_id;
			localStorage.setItem(appModeKey, value);
		}

		var ga = new GlideAjax('VirtualAgentMCPUtilsAjax');
		ga.addParam('sysparm_name', 'retryLastAction');
		var messageId = opener.oauth_message_id;
		ga.addParam('sysparm_messageid', messageId);
		ga.getXMLAnswer(closeWindow);
	}
}

function closeWindow(){
    window.top.opener.location.reload();
    window.top.close();
}
