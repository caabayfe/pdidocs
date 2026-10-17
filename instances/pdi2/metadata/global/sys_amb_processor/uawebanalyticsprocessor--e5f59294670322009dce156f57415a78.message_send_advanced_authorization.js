function /*boolean*/ authorizeSend(/*String*/ channel, /*Map<String, Object>*/ message, /*String*/ sender) {
	// message_send_roles already blocks zero-role publishers; this is defence in depth so a
	// malformed value can never reach the tracker-script builder in GlideWebAnalytics.js even
	// if the role gate is bypassed or a future publisher is misconfigured.
	if (message == null)
		return false;

	var siteId = message.get('weba_site_id');
	if (siteId == null || !String(siteId).match(/^[0-9]{1,32}$/))
		return false;

	var urls = [message.get('weba_rx_url'), message.get('weba_script_path')];
	for (var i = 0; i < urls.length; i++) {
		if (urls[i] == null)
			return false;
		var url = String(urls[i]);
		// Reject quotes/angle-brackets/backslash/whitespace (script-breakout characters) and
		// anything that isn't an absolute https(s) URL or a same-origin path. A lone leading
		// slash not followed by a second slash excludes protocol-relative URLs (//host/...),
		// which would otherwise let a forged message point script.src at an attacker's domain.
		if (url.length > 2048 || url.match(/['"<>\\\s]/) || !url.match(/^(https?:\/\/|\/(?!\/))/))
			return false;
	}

	return true;
}
