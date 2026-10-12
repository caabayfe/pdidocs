(function(finding) {
    // This property is installed as part of the Certificate-based authentication (com.glide.auth.mutual) plugin. 
    // If the property does not exist (default 'false' here), this is a finding. If the property does exist and is false, this is a finding.
    var targetProperty = 'glide.authenticate.mutual.enabled';
    var expectedValue = 'true';
    var defaultValue = 'false';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
