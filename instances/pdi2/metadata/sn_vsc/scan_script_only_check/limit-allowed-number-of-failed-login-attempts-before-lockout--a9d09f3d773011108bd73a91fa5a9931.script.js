(function(finding) {
    var targetTabularQuery1 = new GlideRecord('sysevent_script_action');
    targetTabularQuery1.addQuery('sys_id', '5e44f9bf0a0a0a0a019a6440b2137767');
    targetTabularQuery1.addQuery('active', '1');
    targetTabularQuery1.query();

    var targetTabularQuery2 = new GlideRecord('sysevent_script_action');
    targetTabularQuery2.addQuery('sys_id', 'd92636b2975301008e00958e3b297567');
    targetTabularQuery2.addQuery('active', '1');
    targetTabularQuery2.query();

    var targetProperty = 'glide.user.max_unlock_attempts';
    var expectedValue = 5;
    var defaultValue = 5;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    if ((!targetTabularQuery1.hasNext() && !targetTabularQuery2.hasNext()) || isNaN(propertyValue) || (parseInt(propertyValue, 10) > expectedValue)) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    }
})(finding);
