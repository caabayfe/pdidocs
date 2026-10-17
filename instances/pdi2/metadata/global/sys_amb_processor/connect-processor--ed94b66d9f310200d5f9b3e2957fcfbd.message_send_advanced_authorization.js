function /*boolean*/ authorizeSend(/*String*/ channel, /*Map<String, Object>*/ message, /*String*/ sender) {
	// Don't allow messages to be published from the client.  Connect doesn't ship with any client-side publishing so force it off rather than trying to evaluate seccurity rules for every message someone might try to publish.  Server-generated messages never have a page name starting with amb/connect.  If the session is not interactive then we assume it's server-sent.
	return !gs.isInteractive() || !GlideTransaction.get() || GlideTransaction.get().getPageName().indexOf("amb/connect") != 0;
}
