if (current.operation() == "update") {
	GlideWhiteListManager.get().removeFromPackageWhitelist(previous.classname);
}

GlideWhiteListManager.get().addToPackageWhitelist(current.classname);
GlideClusterMessage.post("whitelist", "ReloadPackage");
