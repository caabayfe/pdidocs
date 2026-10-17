(function(finding) {
    var targetProperty = 'glide.ui.user_cookie.life_span_in_days';
    var expectedValue = 15;
    var defaultValue = 15;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
