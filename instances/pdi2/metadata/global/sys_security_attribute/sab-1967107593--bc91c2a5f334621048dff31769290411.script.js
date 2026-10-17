
answer = gs.isLoggedIn() && gs.getSession().isInteractive();
if(!answer) {
	answer = GlidePluginManager.isActive('com.glide.connect.anonymous_support') && gs.getUserName()==='guest'; 
}
