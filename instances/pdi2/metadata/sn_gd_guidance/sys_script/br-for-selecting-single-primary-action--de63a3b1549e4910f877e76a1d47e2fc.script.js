(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("ga_guidance_action");
    gr.addQuery('guidance', current.guidance);
    gr.addQuery('primary', 'true');
    gr.query();
    if (gr.next() && current.sys_id != gr.getValue('sys_id')) {
        current.setAbortAction(true);
        gs.addInfoMessage(gs.getMessage('Primary Action already exists for this guidance'));
    }
})(current, previous);
