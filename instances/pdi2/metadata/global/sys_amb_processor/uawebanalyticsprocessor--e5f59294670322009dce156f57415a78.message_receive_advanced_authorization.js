function /*boolean*/ authorizeReceive(/*String*/ channel, /*UnmodifiableMap<String, Object>*/ message, /*String*/ sender, /*String*/ recipient) {
	// Defence in depth against a publish-time bypass: a client can include ext.processed_by_glide
	// on its own incoming Bayeux publish to make AMBClusterBroadcastExtension treat the message
	// as already having gone through GlideTransactionProcessor, skipping message_send_roles and
	// authorizeSend on this same processor entirely (they are only ever evaluated inside that
	// transaction path). authorizedToReceiveMessage/authorizeReceive is invoked independently,
	// per recipient, on every delivery attempt regardless of that flag (see
	// AMBProcessorAdapter.MessageReceiveAuthorizer), so duplicating the same payload-shape check
	// here still blocks a forged message from ever reaching a subscriber's browser even when the
	// publish-time checks were skipped.
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
		if (url.length > 2048 || url.match(/['"<>\\\s]/) || !url.match(/^(https?:\/\/|\/(?!\/))/))
			return false;
	}

	return true;
}
