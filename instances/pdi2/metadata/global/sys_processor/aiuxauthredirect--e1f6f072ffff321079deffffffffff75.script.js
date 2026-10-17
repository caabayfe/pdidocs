(function process(g_request, g_response, g_processor) {
    var session = GlideSession.get();
    var redirectUri = GlideSecurityUtils.enforceRelativeURL(g_request.getParameter('uri'));

	if (gs.nil(redirectUri) || redirectUri.substr(0, 1) != '/') {
		g_processor.writeOutput('text/plain; charset=utf-8', gs.getMessage('Unexpected redirect uri. Must be relative and begin with /'));
        return;
    }

	if (session.isLoggedIn()) {
        g_response.sendRedirect(redirectUri);
	} else {
	    // Redirect back here after login so we can append the gck and then redirect
		session.putProperty("starting_page", "/auth_aiux_redirect.do?uri=" + encodeURIComponent(redirectUri));
		session.putProperty("is_direct_redirect", "true");
		g_response.sendRedirect('/navpage.do');
    }

})(g_request, g_response, g_processor);
