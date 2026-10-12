(function (finding) {
  var targetProperty = 'glide.ui.query_string.enforce_valid_choice_on_create';
  var expectedValue = 'true'; 
  var defaultValue = 'false';

  var propertyValue = gs.getProperty(targetProperty, defaultValue);
    
  if (propertyValue != expectedValue) {
    var gr = new GlideRecord('sys_properties');
    gr.get('name', targetProperty);
    finding.setCurrentSource(gr);
    finding.increment();
  } 
})(finding);
