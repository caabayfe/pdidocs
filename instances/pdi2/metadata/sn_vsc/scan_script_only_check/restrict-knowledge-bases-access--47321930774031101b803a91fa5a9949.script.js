(function(finding) {
    var targetProperty = 'glide.knowman.block_access_with_no_user_criteria';
    var expectedValue = 'true';
    var defaultValue = 'false';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
