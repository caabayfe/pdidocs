(function(finding) {
    var targetProperty = 'glide.stax.whitelist_enabled';
    var expectedValue = 'true';
    var defaultValue = 'false';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    // Dependency on `glide.stax.allow_entity_resolution`
    if (gs.getProperty('glide.stax.allow_entity_resolution', 'true').toLowerCase() == 'true') {
        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            if (gr.get('name', targetProperty)) {
                finding.setCurrentSource(gr);
            }
            finding.increment();
        }
    }
})(finding);
