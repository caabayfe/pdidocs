(function(finding) {
    var targetProperty = 'glide.security.3des.static_keys_usable';
    var expectedValue = 'false';
    var defaultValue = 'true';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    var depProperty = 'glide.security.3des.removal_job_status';
    var enforceCheckValue1 = 'KEYS_DEACTIVATED';
 var enforceCheckValue2 = 'RESUPPLIED';
    var depDefaultValue = 'new';
    var depPropertyValue = gs.getProperty(depProperty, depDefaultValue);

    // Let's only throw this check when the job has moved to keys_deactivated/resupplied
    if (depPropertyValue == enforceCheckValue1 || depPropertyValue == enforceCheckValue2) {
        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
