(function executeRule(current, previous /*null when async*/) {

	
    g_scratchpad.standard_ui_enabled = gs.getProperty('com.snc.guided_tours.standard_ui.enable', 'false') === 'true';
    g_scratchpad.sp_enabled = gs.getProperty('com.snc.guided_tours.sp.enable', 'false') === 'true';
})(current, previous);
