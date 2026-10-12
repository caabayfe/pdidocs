(function(finding) {

    if (GlidePluginManager.isActive('com.sn_hr_core')) {
        checkTable('sn_hr_core_profile');
        checkTable('sn_hr_core_case');
        checkTable('sn_hr_core_task');
    }

    function checkTable(tableName) {
        var excludeTable = new GlideRecord('clone_data_exclude');
        excludeTable.addQuery('name', tableName);
        excludeTable.query();
        if (!excludeTable.next()) {
            finding.increment();
        }
    }

})(finding);
