function refreshOpenerAndCloseSelf() {
    if (window.opener) {
        window.onunload = function (e) {
			opener.parentOAuthResult();  
		};
	}
	window.close();
}
