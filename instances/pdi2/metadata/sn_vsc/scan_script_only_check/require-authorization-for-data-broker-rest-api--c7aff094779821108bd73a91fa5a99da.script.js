(function(finding) {

    var targetProperty = 'glide.basicauth.required.databrokerrestapiprocessor';
    var expectedValue = 'true';
    var defaultValue = 'false';

    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        if (gr.hasNext()) {
            finding.setCurrentSource(gr);
        }
        finding.increment();
    }

})(finding);
