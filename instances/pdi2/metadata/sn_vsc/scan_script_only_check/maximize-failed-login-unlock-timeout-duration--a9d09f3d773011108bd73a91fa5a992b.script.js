(function(finding) {
    // Script needs to be active that actually handles functionality
    // Part of High Security Plugin unload
    var scriptGR = new GlideRecord('sysevent_script_action');
    scriptGR.addQuery('sys_id', 'd92636b2975301008e00958e3b297567');
    scriptGR.query();

    var targetProperty = 'glide.user.unlock_timeout_in_mins';
    var expectedValue = 15;
    var defaultValue = 15;
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    var found = scriptGR.next();
    if (found && scriptGR.getValue('active') != '1') {
        finding.setCurrentSource(scriptGR);
        finding.increment();
    } else if (isNaN(propertyValue) || parseInt(propertyValue, 10) < expectedValue) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    } else if (!found) {
        finding.increment();
    } 
})(finding);
