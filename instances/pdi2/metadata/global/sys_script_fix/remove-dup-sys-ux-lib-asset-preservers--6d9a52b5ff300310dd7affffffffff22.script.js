(function() {
	if (pm.isZboot())
        return;
		
    var gr = new GlideRecord('clone_data_preserver');
    gr.addQuery('table', 'sys_ux_lib_asset');
    gr.addQuery('sys_id', '!=', 'da56929dff200310dd7affffffffffbf');
    gr.query();
    while (gr.next()) {
        var preserverId = gr.getUniqueValue();
        gs.info('Deleting duplicate clone_data_preserver for sys_ux_lib_asset: ' + preserverId);

        var pp = new GlideRecord('clone_profile_preservers');
        pp.addQuery('preserver', preserverId);
        pp.query();
        while (pp.next()) {
            gs.info('Deleting associated clone_profile_preserver: ' + pp.getUniqueValue());
            pp.deleteRecord();
        }

        gr.deleteRecord();
    }

    gs.info('Fix script complete: duplicate clone_data_preserver cleanup for sys_ux_lib_asset');
})();
