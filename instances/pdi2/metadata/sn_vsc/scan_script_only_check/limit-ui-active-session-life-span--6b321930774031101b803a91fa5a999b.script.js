(function(finding) {
    var targetProperty = 'glide.ui.active.session.life_span';
    var expectedValue = 720;
    var defaultValue = 0;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    // Value should be greater than or equal to 0 and less than 720
    // 0 = disabled, greater than 720 is too long a timeout
    if (isNaN(propertyValue) || (parseInt(propertyValue, 10) <= 0) || (parseInt(propertyValue, 10) > expectedValue)) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
