(function(finding) {
    var targetProperty = 'glide.record.legacy_cross_scope_access_policy_in_script';
    var expectedValue = 'false';
    var defaultValue = 'true';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        if (gr.get('name', targetProperty)) {
          finding.setCurrentSource(gr);
        }
        finding.increment();
    }
})(finding);
