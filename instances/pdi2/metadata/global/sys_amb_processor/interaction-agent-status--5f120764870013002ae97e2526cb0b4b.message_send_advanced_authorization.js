function /*boolean*/ authorizeSend(/*String*/ channel, /*Map<String, Object>*/ message, /*String*/ sender) {
	return GlideTransaction.get().getPageName().indexOf("amb/meta/subscribe") > -1;
}
