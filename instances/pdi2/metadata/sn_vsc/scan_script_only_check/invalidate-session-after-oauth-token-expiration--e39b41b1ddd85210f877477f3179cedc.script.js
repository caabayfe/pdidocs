(function(finding) {
    var targetProperty = 'glide.authenticate.oauth.post.token.expiration.cookie_auth.disabled';
    var expectedValue = 'true';
    var defaultValue = 'false'; 

    // sys_properties record `true` should exist on zbooted instance
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        if (gr.get('name', targetProperty)) {
            finding.setCurrentSource(gr);
        }
        finding.increment();
    }
})(finding);
