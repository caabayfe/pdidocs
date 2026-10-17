(function (finding) {
  var targetProperty = 'com.glide.soap.guest_user';
  var expectedValue = 'soap.guest'; 
  var defaultValue = 'soap.guest';

  var propertyValue = gs.getProperty(targetProperty, defaultValue);
    
  if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
	var gr = new GlideRecord('sys_properties');
    gr.get('name', targetProperty);
    finding.setCurrentSource(gr); 
    finding.increment();
  } 
})(finding);
