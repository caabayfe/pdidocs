(function(finding) {

    if (GlidePluginManager.isActive('com.snc.platform.security.oauth')) {
        var targetProperty = 'glide.oauth.allow.parameters.in.post.body.only';
        var expectedValue = 'true';
        var propertyValue = gs.getProperty(targetProperty, 'false');

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
