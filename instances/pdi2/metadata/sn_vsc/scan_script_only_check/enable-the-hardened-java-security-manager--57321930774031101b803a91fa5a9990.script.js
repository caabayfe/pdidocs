(function(finding) {
    var targetProperty = 'glide.security.manager';
    var expectedValue = 'com.glide.sys.security.ContextualSecurityManager';
    var defaultValue = 'com.glide.sys.security.ContextualSecurityManager';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
