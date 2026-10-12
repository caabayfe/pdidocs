(function (finding) {

  var dependentProperty = 'com.glide.communications.httpclient.verify_hostname';
  var dependentPropertyExpectedValue = 'true';
  var dependentPropertyDefaultValue = 'false';
  var dependentPropertyValue = gs.getProperty(dependentProperty, dependentPropertyDefaultValue);


  var targetProperty = 'com.glide.communications.trustmanager_trust_all';
  var expectedValue = 'false'; 
  var defaultValue = 'true';

  var propertyValue = gs.getProperty(targetProperty, defaultValue);
    
  if (propertyValue.toLowerCase() != expectedValue.toLowerCase() && dependentPropertyValue.toLowerCase() != dependentPropertyExpectedValue.toLowerCase()) {
    var gr = new GlideRecord('sys_properties');
    gr.get('name', targetProperty);
    finding.setCurrentSource(gr);
    finding.increment();
  } 
})(finding);
