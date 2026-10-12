(function(finding) {
    var targetProperty = 'sn_kb_social_qa.max_subscriptions_per_user_daily';
    var expectedValue = 500;
    var defaultValue = 500;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
