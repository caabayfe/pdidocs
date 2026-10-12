(function(finding) {
    if (GlidePluginManager.isActive('com.snc.external_user_self_registration')) {
        var targetProperty = 'sn_ext_usr_reg.allowed_email_domains';
        var defaultValue = '""';

        var propertyValue = gs.getProperty(targetProperty, defaultValue).replace(/"/g, '').replace(/'/g, '').trim();

        if (propertyValue.length == 0) {
            var grProp = new GlideRecord('sys_properties');
            if (grProp.get('name', targetProperty)) {
                finding.setCurrentSource(grProp);
            }
            finding.increment();
        }
    }
})(finding);
