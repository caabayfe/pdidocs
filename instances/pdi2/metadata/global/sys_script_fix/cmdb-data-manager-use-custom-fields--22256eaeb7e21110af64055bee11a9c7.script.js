if (!GlidePluginManager.isZboot() && GlidePluginManager.isActive('com.snc.cmdb.csdm.activation')) {
    var grRetDef = new GlideRecord('cmdb_retirement_custom_definitions');
    grRetDef.addQuery('table', 'cmdb_ci');
    grRetDef.query();
    if (grRetDef.getRowCount() == 1 && grRetDef.next()) {
        gs.log("Making cmdb_ci entry active for definition of 'Retired'");
        grRetDef.setValue('active', true);
        grRetDef.update();

        var grBusRule = new GlideRecord('sys_script');
        //Following sys_id is for Business Rule "Cascade retire for custom definitions"
        var ruleSysId = '402709a0b72695102455c3fdde11a9d5';
        if(grBusRule.get(ruleSysId)) {
            grBusRule.setValue('active', true);
            grBusRule.update();
        }
    }
}
