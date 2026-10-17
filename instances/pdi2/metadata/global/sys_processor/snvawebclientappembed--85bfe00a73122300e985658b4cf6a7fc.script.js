(function process(g_request, g_response, g_processor) {
	//#UseSimpleSessionSetup

	g_response.setHeader("Content-Security-Policy", "frame-ancestors " + gs.getProperty("com.glide.cs.embed.csp_frame_ancestors"));
	g_response.setHeader("X-Frame-Options", gs.getProperty("com.glide.cs.embed.xframe_options"));

	var jr = new GlideJellyRunner();
	jr.setTwoPhase(true);

	var query = g_request.getQueryString() || '';
	query.split('&').map(function(p) {
		var part = p.split('=');

		jr.setVariable("jvar_" + part[0].toLowerCase(), part[1] || true);
	});

	var template = jr.runFromTemplate('sn-va-web-client-app-embed.xml');
	g_processor.writeOutput('text/html;charset=UTF-8', template);
})(g_request, g_response, g_processor);
