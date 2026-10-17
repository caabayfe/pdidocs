answer = GlidePluginManager.isActive('com.glide.high_security') ? gs.hasRole('security_admin') && gs.hasRole('admin') : gs.hasRole('admin');
