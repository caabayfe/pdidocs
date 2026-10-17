function onBefore(current, previous) {
   if (!GlidePluginManager.isActive('com.glide.ui.m'))
      current.addQuery('target_type', '!=', 'mobile_screen');
}
