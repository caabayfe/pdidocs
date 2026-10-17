(function(finding) {
    var targetProperty = 'password_reset.sms.expiry';
    var expectedValue = 5;
    var defaultValue = 5;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
