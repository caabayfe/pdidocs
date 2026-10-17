(function(finding) {
    var targetProperty1 = 'glide.basicauth.required.soap';
    var expectedValue1 = 'true';
    var defaultValue1 = 'false';

    var targetProperty2 = 'glide.soap.require_ws_security';
    var expectedValue2 = 'true';
    var defaultValue2 = 'false';

    var propertyValue1 = gs.getProperty(targetProperty1, defaultValue1);
    var propertyValue2 = gs.getProperty(targetProperty2, defaultValue2);

    // Check that basic auth is required first    
    if (propertyValue1.toLowerCase() != expectedValue1.toLowerCase()) {

        // If WS Security is also not required, then we have a finding.
        if (propertyValue2.toLowerCase() != expectedValue2.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty1);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
