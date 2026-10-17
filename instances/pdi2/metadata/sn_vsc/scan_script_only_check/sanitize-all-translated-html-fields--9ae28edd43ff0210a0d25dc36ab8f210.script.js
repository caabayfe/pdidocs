(function(finding) {
    var targetProperty = 'glide.translated_html.sanitize_all_fields';
    var expectedValue = 'true';
    var defaultValue  = 'false';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
      var gr = new GlideRecord('sys_properties');
      if (gr.get('name', targetProperty)) {
        finding.setCurrentSource(gr);
      }
      finding.increment();
    }
    })(finding);
