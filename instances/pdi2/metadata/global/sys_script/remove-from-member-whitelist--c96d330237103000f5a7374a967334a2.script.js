GlideWhiteListManager.get().removeFromMemberWhitelist(current.classname, current.membername, current.signature);
GlideClusterMessage.post("script", "GlideWhiteListManager.get().removeFromMemberWhitelist('" + current.classname + "', '" + current.membername + "', '" + current.signature + "');");
