(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.sys_mlb_enabled = gs.getProperty('com.snc.pa.dm.enable.mlb', false);
    g_scratchpad.indicator_type = current.getValue('type');
    g_scratchpad.isMlbEnabled = current.getValue('is_mlb_enabled');

})(current, previous);
