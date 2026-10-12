(function(finding) {
    var targetProperty = 'csm_cmdb_model.customer_visible_flag';
    var expectedValue = 'true';
    var defaultValue = 'false';

    var pluginManager = new GlidePluginManager();
    var enabledPlugin = pluginManager.isActive('com.sn_customerservice');
    if(enabledPlugin) {
      var propertyValue = gs.getProperty(targetProperty, defaultValue);

      if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
          var gr = new GlideRecord('sys_properties');
          gr.get('name', targetProperty);
          finding.setCurrentSource(gr);
          finding.increment();
      }

    }

    
})(finding);
