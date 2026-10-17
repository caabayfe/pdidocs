(function(finding) {

    // leaving as 3 distinct cases for easy auditability or editing of default values 
    var targetProperty = 'com.glide.security.query_acl.enabled.sub_lists';
    var expectedValue = 'true';
    var defaultValue  = 'true';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    var targetProperty2 = 'com.glide.security.query_acl.enabled.list_count';
    var expectedValue2 = 'true';
    var defaultValue2  = 'true';
    var propertyValue2 = gs.getProperty(targetProperty2, defaultValue2);

    var targetProperty3 = 'glide.security.query_acl.enabled.data_table';
    var expectedValue3 = 'true';
    var defaultValue3  = 'true';
    var propertyValue3 = gs.getProperty(targetProperty2, defaultValue2);

    if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty);
        finding.setCurrentSource(gr);
        finding.increment();
    } else if (propertyValue2.toLowerCase() != expectedValue2.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty2);
        finding.setCurrentSource(gr);
        finding.increment();
    } else if (propertyValue3.toLowerCase() != expectedValue3.toLowerCase()) {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', targetProperty3);
        finding.setCurrentSource(gr);
        finding.increment();
    }

})(finding);
