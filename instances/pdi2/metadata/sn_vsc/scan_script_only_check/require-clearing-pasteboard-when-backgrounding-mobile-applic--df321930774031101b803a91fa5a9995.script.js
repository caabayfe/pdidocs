(function(finding) {
    var targetProperty = 'glide.sg.clear_pasteboard_when_backgrounded';
    var expectedValue = 'true';
    var propertyValue = gs.getProperty(targetProperty, 'true');

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
