GlideWhiteListManager.get().removeFromPackageWhitelist(current.classname);
GlideClusterMessage.post("script", "GlideWhiteListManager.get().removeFromPackageWhitelist('" + current.classname + "');");
