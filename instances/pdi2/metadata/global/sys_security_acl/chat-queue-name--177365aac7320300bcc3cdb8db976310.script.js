// show to all users logged in an interactive session.
answer = gs.isLoggedIn() && gs.getSession().isInteractive();
if(!answer) {
	// show to guest users only if "Anonymous Connect Support" plugin is installed
	answer = GlidePluginManager.isActive('com.glide.connect.anonymous_support') && gs.getUserName()==='guest'; 
}
