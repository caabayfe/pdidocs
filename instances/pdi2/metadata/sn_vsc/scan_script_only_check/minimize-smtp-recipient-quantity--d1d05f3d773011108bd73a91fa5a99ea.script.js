(function(finding) {
    var targetProperty = 'glide.email.smtp.max_recipients';
    var expectedValue = 100;
    var defaultValue = 100;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
