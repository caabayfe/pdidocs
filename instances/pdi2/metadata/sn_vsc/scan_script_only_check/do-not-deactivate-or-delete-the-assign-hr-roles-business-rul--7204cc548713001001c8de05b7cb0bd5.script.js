(function(finding) {

    if (GlidePluginManager.isActive('com.sn_hr_core')) {
        var businessRule = new GlideRecord('sys_script');
        //The ID is for the Synchronize fields to sys_user business rule
        businessRule.addQuery('sys_id', '3358c6df0b43120025666f3ef6673a6d');
        businessRule.query();
        if (!businessRule.next() || !businessRule.isValid() || !businessRule.active) {
            finding.setCurrentSource(businessRule);
            finding.increment();
        }
    }
})(finding);
