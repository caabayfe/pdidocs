(function(finding) {
    var targetProperty = 'glide.outbound_http_log.override';
    var insecureValue = 'true';
    var defaultValue = 'false';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    var dependentProperty = 'glide.outbound_http_log.override.level';
    var dependentInsecureValues = 'all,elevated';
    var dependentDefaultValue = '';
    var dependentPropertyValue = gs.getProperty(dependentProperty, dependentDefaultValue);


    if (propertyValue.toLowerCase() == insecureValue.toLowerCase()) {
        for (i = 0; i < dependentInsecureValues.length; i++) {
            if (dependentPropertyValue.toLowerCase() == dependentInsecureValues.split(',')[i]) {
                var gr = new GlideRecord('sys_properties');
                if (gr.get('name', dependentProperty)) {
                    finding.setCurrentSource(gr);
                }
                finding.increment();
            }
        }
    }
})(finding);
