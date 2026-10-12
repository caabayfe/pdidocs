(function(finding) {
 if (GlidePluginManager.isActive('com.sn.itsm_aia') && GlidePluginManager.isActive('com.sn.azure_ad.spoke')) {
  var targetProperty = 'sn_itsm_aia.office_365_group_member_approval.required';
  var expectedValue = 'true';
  var defaultValue  = 'true';
  var propertyValue = gs.getProperty(targetProperty, defaultValue);

  if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
   var gr = new GlideRecord('sys_properties');
   gr.get('name', targetProperty);
   finding.setCurrentSource(gr);
   finding.increment();
  }
 }
})(finding);
