(function (finding) {
  var targetProperty = 'glide.security.groupby_acl_check';
  var expectedValue = 'true'; 
  var defaultValue = 'true';

  var propertyValue = gs.getProperty(targetProperty, defaultValue);
    
  if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
    var gr = new GlideRecord('sys_properties');
    gr.get('name', targetProperty);
    finding.setCurrentSource(gr);
    finding.increment();
  } 
})(finding);
