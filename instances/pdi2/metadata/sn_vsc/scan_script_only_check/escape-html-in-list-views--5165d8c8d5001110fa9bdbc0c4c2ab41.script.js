(function(finding) {
    var targetProperty = 'glide.ui.escape_html_list_field';
    var expectedValue = 'true';
    var defaultValue = 'true';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
