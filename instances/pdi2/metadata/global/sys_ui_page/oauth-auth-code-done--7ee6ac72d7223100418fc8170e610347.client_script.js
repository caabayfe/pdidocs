function refreshOpenerAndCloseSelf() {
    if (window.opener) {
        window.opener.location.reload();
	        window.close();
	}
}
