(function (finding) {

  var pluginManager = new GlidePluginManager();
  var enabledPlugin = pluginManager.isActive('com.glide.service-portal.customer-portal');
  if (enabledPlugin) {
    var targetProperty = 'glide.service_portal.enforce_cross_scope_check_in_form';
    var expectedValue = 'true'; 
    var defaultValue = 'true';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);
    
    if (propertyValue != expectedValue) {
      var gr = new GlideRecord('sys_properties');
      gr.get('name', targetProperty);
      finding.setCurrentSource(gr);
      finding.increment();
    } 
  }
})(finding);
