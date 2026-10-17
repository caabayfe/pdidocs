function closeSelf() {
	if (window.opener) {
		window.close();
	} else {
		top.location.href = "/oauth_auth_code_done.do";
	}
}
