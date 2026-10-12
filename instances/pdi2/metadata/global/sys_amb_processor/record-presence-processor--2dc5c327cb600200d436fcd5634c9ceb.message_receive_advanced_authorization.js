function /*boolean*/ authorizeReceive(/*String*/ channel, /*UnmodifiableMap<String, Object>*/ message, /*String*/ sender, /*String*/ recipient) {
	return !GlideProperties.getBoolean("glide.ui.presence.disabled", false);
}
