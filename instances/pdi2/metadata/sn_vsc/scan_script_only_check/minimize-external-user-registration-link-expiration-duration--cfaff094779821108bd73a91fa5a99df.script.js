(function(finding) {
    if (new GlidePluginManager().isActive('com.snc.external_user_self_registration')) {
        var targetProperty = 'sn_ext_usr_reg.Reg_link_expiration_days';
        var expectedValue = 3;
        var defaultValue = 3;
        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        if (isNaN(propertyValue) || parseInt(propertyValue, 10) > expectedValue) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
