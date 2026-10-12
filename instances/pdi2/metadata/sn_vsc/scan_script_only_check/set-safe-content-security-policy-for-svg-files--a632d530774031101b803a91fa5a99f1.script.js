(function(finding) {
    var targetProperty = 'com.glide.csp.self_script_src_svg';
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
