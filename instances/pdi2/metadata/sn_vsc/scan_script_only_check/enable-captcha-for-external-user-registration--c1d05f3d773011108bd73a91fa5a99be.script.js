(function(finding) {
    if (new GlidePluginManager().isActive('com.snc.external_user_self_registration')) {
        var targetProperty = 'sn_ext_usr_reg.captchaEnabled';
        var expectedValue = 'true';
        var defaultValue = 'true';
        var propertyValue = gs.getProperty(targetProperty, defaultValue);

        if (propertyValue.toLowerCase() != expectedValue.toLowerCase()) {
            var gr = new GlideRecord('sys_properties');
            gr.get('name', targetProperty);
            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
