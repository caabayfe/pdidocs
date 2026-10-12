(function(finding) {
    var targetProperty = 'glide.http.response.get_body.limit.enabled';
    var expectedValue = 'true';
    var defaultValue = 'true';

    var targetProperty2 = 'glide.http.response.get_body.limit';
    var expectedValue2 = 524288000;
    var defaultValue2 = 524288000;

    var propertyValue = gs.getProperty(targetProperty, defaultValue);
    var propertyValue2 = gs.getProperty(targetProperty2, defaultValue2);
    var isFinding1 = propertyValue.toLowerCase() != expectedValue.toLowerCase();
    var isFinding2 = parseInt(propertyValue2, 10) > expectedValue2;
    if (isFinding1 || isFinding2) {
        var gr = new GlideRecord('sys_properties');
        if (isFinding1) {
            gr.get('name', targetProperty);
        } else if (isFinding2) {
            gr.get('name', targetProperty2);
        }
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
