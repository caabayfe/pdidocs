(function(finding) {
  var targetProperty = 'glide.authenticate.multifactor';
  var expectedValue = 'true';
  var defaultValue = 'false';
  var propertyValue = gs.getProperty(targetProperty, defaultValue);
  if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
    var gr = new GlideRecord('sys_properties');
    if (gr.get('name', targetProperty)) {
      finding.setCurrentSource(gr);
    }
    finding.increment();
  } else {
    var targetTabularQuery = new GlideRecord('multi_factor_criteria');
    targetTabularQuery.addQuery('sys_id', 'd427668b73003300fdbd04fbc4f6a7b6');
    targetTabularQuery.query();
    if (targetTabularQuery.next() && targetTabularQuery.active == false) {
      finding.setCurrentSource(targetTabularQuery);
      finding.increment();
    }
  }
})(finding);
