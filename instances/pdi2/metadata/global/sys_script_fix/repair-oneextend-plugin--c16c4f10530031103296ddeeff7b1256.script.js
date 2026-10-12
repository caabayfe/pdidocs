var pluginName = 'com.glide.one_extend';
var pluginManager = new GlidePluginManager();
if (pluginManager.isActive(pluginName))
   pluginManager.repairPlugin(pluginName);
