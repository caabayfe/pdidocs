(function(finding) {
    var targetProperty = 'glide.active.session.timeout.exception.roles';
    var expectedValue = 'edge_encryption,mid_server,maint';
    var defaultValue = 'edge_encryption,mid_server,maint';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);

    var expectedValueList = expectedValue.split(',');
    var propertyValueList = propertyValue.split(',');

    //Trigger a finding if a role outside the expected 2 roles is included
    for (i = 0; i < propertyValueList.length; i++) {
        if (expectedValueList.indexOf(propertyValueList[i]) == -1) {
            var gr = new GlideRecord('sys_properties');
            if (gr.get('name', targetProperty)) {
                finding.setCurrentSource(gr);
            }
            finding.increment();
        }
    }
})(finding);
