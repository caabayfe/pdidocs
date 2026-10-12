(function(finding) {
    var targetProperty = 'glide.multifactor.onetime.code.validity';
    var expectedValue = 10;
    var propertyValue = gs.getProperty(targetProperty, 10);

    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr)
        finding.increment();
    }
})(finding);
