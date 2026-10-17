answer = false;

if (gs.isLoggedIn())
	answer = true;

if (pm.isRegistered("com.glide.explicit_roles") && gs.getProperty("glide.security.use_explicit_roles", "false") == "true")
	answer = true;
