(function(finding) {
    var targetProperty1 = 'glide.xml.entity.whitelist';
    var expectedValue1 = 'http://java.sun.com/j2ee/dtds/';
    var defaultValue1 = 'http://java.sun.com/j2ee/dtds/';
    var propertyValue1 = gs.getProperty(targetProperty1, defaultValue1);

    var targetProperty2 = 'glide.xml.entity.whitelist.enabled';
    var expectedValue2 = 'true';
    var defaultValue2 = 'true';
    var propertyValue2 = gs.getProperty(targetProperty2, defaultValue2);
    var grProp = new GlideRecord('sys_properties');

    // Finding if whitelist is not enabled at all
    if (propertyValue2.toLowerCase() != expectedValue2.toLowerCase()) {
        if (grProp.get('name', targetProperty2)) {
            finding.setCurrentSource(grProp);
        }
        finding.increment();
    }

    // Finding if whitelist is enabled, but more than the OOB URL is present
    // This strict URL check is fine for now given the single OOB value
    if ((propertyValue2.toLowerCase() == 'true') && (propertyValue1.toLowerCase() != expectedValue1.toLowerCase())) {
        if (grProp.get('name', targetProperty1)) {
            finding.setCurrentSource(grProp);
        }
        finding.increment();
    }

})(finding);
