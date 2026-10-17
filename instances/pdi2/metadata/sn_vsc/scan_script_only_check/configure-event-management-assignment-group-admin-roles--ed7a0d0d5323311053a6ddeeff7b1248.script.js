(function(finding) {
    var enabledPlugin = new GlidePluginManager().isActive('com.sn_em_connector');

    var targetProperty = 'evt_mgmt.connector_assignment_group_admin_roles';
    var expectedValue = 'admin,evt_mgmt_admin,sn_sow_srm.srm_admin';
    var defaultValue = 'admin,evt_mgmt_admin,sn_sow_srm.srm_admin';
    var propertyValue = gs.getProperty(targetProperty, defaultValue);
    var expectedValueList = expectedValue.split(',');
    var propertyValueList = propertyValue.split(',');

    if (enabledPlugin) {
        // We want to match the default list entries, more might mean an extra uncessary role has been added
        for (i = 0; i < propertyValueList.length; i++) {
            if (expectedValueList.indexOf(propertyValueList[i]) == -1) {
                var gr = new GlideRecord('sys_properties');
                gr.get('name', targetProperty);
                finding.setCurrentSource(gr);
                finding.increment();
            }
        }
    }
})(finding);
