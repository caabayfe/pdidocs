function dropSysOverridesColumn(tableName) {
    if (pm.isZboot())
        return;

    var sysOverrides = 'sys_overrides';

    gs.info('Drop column started for table: ' + tableName);
    gs.dropColumn(tableName, sysOverrides);
    gs.info('Drop column completed for table: ' + tableName);
}

dropSysOverridesColumn('par_component');
dropSysOverridesColumn('analytics_visualization');
dropSysOverridesColumn('par_visualization');
dropSysOverridesColumn('sys_report');
