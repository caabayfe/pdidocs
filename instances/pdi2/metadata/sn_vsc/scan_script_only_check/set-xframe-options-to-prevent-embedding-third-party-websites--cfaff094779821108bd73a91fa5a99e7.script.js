(function(finding) {
    var targetProperty = 'com.glide.cs.embed.xframe_options';
    var expectedValue1 = 'DENY';
    var expectedValue2 = 'SAMEORIGIN';
    var defaultValue = '';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if ((propertyValue.toLowerCase() != expectedValue1.toLowerCase()) && (propertyValue.toLowerCase() != expectedValue2.toLowerCase())) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
