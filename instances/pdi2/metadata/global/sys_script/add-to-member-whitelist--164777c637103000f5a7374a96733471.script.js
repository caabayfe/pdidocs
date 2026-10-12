if (current.operation() == "update") {
	GlideWhiteListManager.get().removeFromMemberWhitelist(previous.classname, previous.membername, previous.signature);
}

GlideWhiteListManager.get().addToMemberWhitelist(current.classname, current.membername, current.signature);
GlideClusterMessage.post("whitelist", "ReloadMembers");
