(function executeRule(current, previous /*null when async*/ ) {
    if (!current.getDisplayValue('active')) {
        return;
    }

    var lifecycleGR = new GlideRecord('sam_sw_product_lifecycle');
    lifecycleGR.addQuery('norm_edition', current.getValue('norm_edition'));
    lifecycleGR.addQuery('norm_version', current.getValue('norm_version'));
    lifecycleGR.addQuery('norm_full_version', current.getValue('norm_full_version'));
    lifecycleGR.addQuery('lifecycle_type', current.getValue('lifecycle_type'));
    lifecycleGR.addQuery('lifecycle_phase', current.getValue('lifecycle_phase'));
    lifecycleGR.addQuery('source', current.getValue('source'));
    lifecycleGR.addQuery('sys_domain', current.getValue('sys_domain')).addOrCondition('sys_domain', 'global');
    lifecycleGR.addQuery('active', current.getValue('active'));

    if (GlidePluginManager.isActive('com.snc.sams')) {
        lifecycleGR.addQuery('norm_product', current.getValue('norm_product'));
    } else {
        lifecycleGR.addQuery('publisher', current.getValue('publisher'));
        lifecycleGR.addQuery('product_name', current.getValue('product_name'));
    }
	lifecycleGR.query();

    // 2nd check is to allow updates of other fields (such as start date)
    if (lifecycleGR.next() && lifecycleGR.getValue('sys_id') != current.getValue('sys_id')) {
        gs.addErrorMessage(gs.getMessage('An internal lifecycle record with the same combination of Publisher, Product, Version, Edition, and Lifecycle Phase already exists.'));
        current.setAbortAction(true);
    }
})(current, previous);
