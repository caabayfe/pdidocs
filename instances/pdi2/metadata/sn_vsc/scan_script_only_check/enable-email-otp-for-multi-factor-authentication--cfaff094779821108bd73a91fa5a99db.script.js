(function(finding) {
    var targetProperty = 'glide.authenticate.multifactor.email.otp.enabled';
    var expectedValue = 'false';
    var propertyValue = gs.getProperty(targetProperty, 'true');

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
