(function(finding) {
    var targetProperty1 = 'glide.security.url.whitelist.strict_check';
    var expectedValue1 = 'true';
    var defaultValue1 = 'true';
    var propertyValue1 = gs.getProperty(targetProperty1, defaultValue1);

    var targetProperty2 = 'glide.security.url.whitelist';
    var defaultValue2 = '';
    var propertyValue2 = gs.getProperty(targetProperty2, defaultValue2);

    if ((propertyValue1.toLowerCase() != expectedValue1.toLowerCase()) && (propertyValue2.toLowerCase() == defaultValue2.toLowerCase())) {
    //if strict check is NOT true AND whitelist IS empty
        var gr1 = new GlideRecord('sys_properties');
        gr1.get('name', targetProperty1);
        finding.setCurrentSource(gr1);
        finding.increment();

        var gr2 = new GlideRecord('sys_properties');
        gr2.get('name', targetProperty2);
        finding.setCurrentSource(gr2);
        finding.increment();
    }
})(finding);
