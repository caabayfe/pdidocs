function /*boolean*/ authorizeSend(/*String*/ channel, /*Map<String, Object>*/ message, /*String*/ sender) {
	// Personal channel: only ever legitimately published server-side (CollabResponder
	// subclasses, CollabMessageService.publishGlobalUserAlert()). No client should ever
	// be allowed to publish directly to /collabchat/user/** through the /amb endpoint.
	//
	// verify_message_sent_from_server is not sufficient on its own: it only checks that
	// the payload carries sent_by == AMBServer.getHashCode(), and that marker is echoed
	// unmodified in every message delivered to subscribers (nothing strips it), so any
	// recipient can read it off the wire and replay it in a forged publish.
	//
	// Deliberately NOT gated on gs.isInteractive(): HTTP basic-auth sessions are
	// non-interactive (HTTPAuthSessionSetup sets fInteractive = false), which is exactly
	// how the reported PoC authenticates, so an isInteractive() test would let the attack
	// through. Gate only on the request arriving via /amb — that is the attack surface,
	// and legitimate server pushes run in background/other-page transactions.
	return !GlideTransaction.get() || GlideTransaction.get().getPageName().indexOf("amb/") != 0;
}
