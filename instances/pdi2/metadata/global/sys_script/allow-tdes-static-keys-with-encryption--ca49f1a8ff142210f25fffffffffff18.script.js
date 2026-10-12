(function executeRule(current, previous /*null when async*/) {

	if (!GlideProperties.getBoolean("glide.security.3des.static_keys_usable")) {
		GlidePropertiesDB.set("glide.security.3des.static_keys_usable", "true");
	}

})(current, previous);
