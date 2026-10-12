(function(finding) {
    var targetProperty = 'glide.pwd_reset.onetime.token.validity';
    var expectedValue = 1;
    var propertyValue = gs.getProperty(targetProperty, 1);

    if (isNaN(propertyValue) || parseInt(propertyValue) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        if (gr.get('name', targetProperty)) {
          finding.setCurrentSource(gr);
        }
        finding.increment();
    }
})(finding);
