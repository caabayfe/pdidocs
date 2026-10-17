(function (finding) {
  var pluginManager = new GlidePluginManager();
  var enabledPlugin = pluginManager.isActive('com.glide.explicit_roles');
  var enabledCSM = pluginManager.isActive('com.snc.cs_base');
  if (enabledPlugin && enabledCSM) {
	var targetProperty = 'glide.security.explicit_roles.enable_internal_user_blacklist';
	var expectedValue = 'true';
	var defaultValue = 'false';

	var propertyValue = gs.getProperty(targetProperty, defaultValue);

	if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
		var gr = new GlideRecord('sys_properties');
		if (gr.get('name', targetProperty)) {
			finding.setCurrentSource(gr);
		}
		finding.increment();
	} 
  }
})(finding);
