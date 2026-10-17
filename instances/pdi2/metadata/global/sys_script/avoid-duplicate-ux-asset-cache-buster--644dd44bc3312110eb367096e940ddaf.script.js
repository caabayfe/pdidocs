(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sys_ux_asset_cache_buster');
    gr.setLimit(1);
    gr.query();
    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage('Only 1 cache buster record allowed'));
        current.setAbortAction(true);
    }
})(current, previous);
