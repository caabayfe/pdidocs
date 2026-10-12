(function(finding) {
    var enforcePublicWidgetSecurity = gs.getProperty('glide.service_portal.widget.enforce_public_check', 'true');

    if (enforcePublicWidgetSecurity.toLowerCase() == 'true') {
        var targetProperty = 'glide.service_portal.widget.table_allow_list';
        var expectedValue = '';
        var defaultValue = '';
        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            if (gr.get('name', targetProperty)) {
              finding.setCurrentSource(gr);
            }
            finding.increment();
        }
    }
    })(finding);
