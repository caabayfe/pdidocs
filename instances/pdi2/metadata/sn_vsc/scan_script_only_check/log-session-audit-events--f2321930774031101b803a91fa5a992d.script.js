(function(finding) {
        var targetProperty = 'glide.authenticate.session_access.log_audit_event';
        var expectedValue = 'true';
        var defaultValue = 'true';
        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
})(finding);
