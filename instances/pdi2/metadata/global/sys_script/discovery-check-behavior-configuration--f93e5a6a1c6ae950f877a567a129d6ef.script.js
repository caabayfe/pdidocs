(function executeRule(current, previous /*null when async*/ ) {
    var selectedMids = current.mid_servers.split(',');
    var gr = new GlideRecordSecure('discovery_functionality');
    gr.addQuery('behavior', current.getValue('behavior'));
    gr.addQuery('phase', current.phase);
    gr.addQuery('sys_id', '!=', current.sys_id);
    gr.query();

    while (gr.next()) {
        var existingMids = gr.mid_servers.split(',');
        var commonMids = new DiscoArrayUtil().intersect(existingMids, selectedMids);
        if (commonMids.length > 0) {
            var commonMidName = new MIDServer(commonMids[0]).getName();
            gs.addErrorMessage(gs.getMessage("MID Server '{0}' already exists in another functionality of same phase. Please retry with different mid server(s).", commonMidName));
            current.setAbortAction(true);
            break;
        }
    }

})(current, previous);
