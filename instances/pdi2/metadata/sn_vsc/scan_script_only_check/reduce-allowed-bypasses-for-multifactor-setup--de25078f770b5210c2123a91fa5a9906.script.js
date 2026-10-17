(function(finding) {

    var dependentProperty = 'glide.authenticate.multifactor';
    var dependentPropertyDefault = 'false';
    var dependentPropertyValue = gs.getProperty(dependentProperty, dependentPropertyDefault);
    var dependentPropertyApplies = 'true';
    var maxRecommendedValue = 0;
    var propertyValue = 0;

    if (dependentPropertyValue.toLowerCase() == dependentPropertyApplies.toLowerCase()) {
        var targetProperty = 'glide.authenticate.multifactor.setup.bypass.count';
        var defaultValue = 0;
        propertyValue = gs.getProperty(targetProperty, defaultValue);
    }

    if (parseInt(propertyValue, 10) > maxRecommendedValue) {
        var gr = new GlideRecord('sys_properties');
        if (gr.get('name', targetProperty)) {
            finding.setCurrentSource(gr);
        }
        finding.increment();
    }
})(finding);
