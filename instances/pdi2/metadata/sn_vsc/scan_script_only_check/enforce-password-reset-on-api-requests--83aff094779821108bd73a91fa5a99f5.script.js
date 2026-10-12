(function(finding) {
    var targetProperty = 'glide.authenticate.api.user.reset_password.mandatory';
    var expectedValue = 'true';

    // Goofy try/catch here because of glide.*password property in a scoped app rules
    try {
      var propertyValue = gs.getProperty(targetProperty, 'false');
      if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
      }
    } catch(ex) {
      finding.increment();
    }  

})(finding);
