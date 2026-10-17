(function(finding) {
    var targetProperty = 'glide.sandbox.usersession.allow_unsanitized_messages';
    var expectedValue = 'false';
    var defaultValue = 'true';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
