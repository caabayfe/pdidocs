(function (finding) {
  var targetProperty = 'password_reset.sms.pause_window';
  var expectedValue = 2;
  var defaultValue = 1;
  var propertyValue = gs.getProperty(targetProperty, defaultValue);

  if (isNaN(propertyValue) || parseInt(propertyValue, 10) < expectedValue) {
	var gr = new GlideRecord('sys_properties');
	gr.get('name', targetProperty);
	finding.setCurrentSource(gr);
    finding.increment();
  } 
})(finding);
